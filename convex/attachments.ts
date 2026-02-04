import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { v4 as uuidv4 } from 'uuid';

import { internal } from './_generated/api';
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from './_generated/server';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    // Disable automatic CRC32 checksums — they add query params that trigger
    // CORS preflight and aren't supported by Cloudflare R2 presigned URLs.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
}

export const getAttachmentsByTrade = query({
  args: { tradeId: v.id('trades') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const trade = await ctx.db.get(args.tradeId);
    if (!trade || trade.userId !== userId) {
      throw new Error('Not authorized');
    }

    const attachments = await ctx.db
      .query('attachments')
      .withIndex('by_trade', (q) => q.eq('tradeId', args.tradeId))
      .order('asc')
      .collect();

    return attachments.map((a) => ({
      id: a._id,
      storageKey: a.storageKey,
      filename: a.filename,
      contentType: a.contentType,
      size: a.size,
      uploadedAt: a.uploadedAt,
    }));
  },
});

export const generateUploadUrl = action({
  args: {
    tradeId: v.id('trades'),
    filename: v.string(),
    contentType: v.string(),
    fileSize: v.number(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    uploadUrl: string;
    storageKey: string;
  }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    if (args.fileSize > MAX_FILE_SIZE) {
      throw new Error('File exceeds 5MB limit');
    }
    if (!ALLOWED_TYPES.includes(args.contentType)) {
      throw new Error('Only JPEG and PNG images are supported');
    }

    const storageKey = `${userId}/${args.tradeId}/${Date.now()}-${uuidv4()}-${args.filename}`;

    const client = getR2Client();
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: storageKey,
      ContentType: args.contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });

    return { uploadUrl, storageKey };
  },
});

export const createAttachment = mutation({
  args: {
    tradeId: v.id('trades'),
    storageKey: v.string(),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const trade = await ctx.db.get(args.tradeId);
    if (!trade || trade.userId !== userId) {
      throw new Error('Not authorized');
    }

    const attachmentId = await ctx.db.insert('attachments', {
      userId,
      tradeId: args.tradeId,
      storageKey: args.storageKey,
      filename: args.filename,
      contentType: args.contentType,
      size: args.size,
      uploadedAt: Date.now(),
    });

    return { id: attachmentId };
  },
});

export const generateDownloadUrl = action({
  args: { storageKey: v.string() },
  handler: async (ctx, args): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const client = getR2Client();
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: args.storageKey,
    });

    return await getSignedUrl(client, command, { expiresIn: 3600 });
  },
});

// Internal helpers used by deleteAttachment action
export const _getAttachment = internalQuery({
  args: { id: v.id('attachments') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const _removeAttachment = internalMutation({
  args: { id: v.id('attachments') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const deleteAttachment = action({
  args: { id: v.id('attachments') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const attachment = await ctx.runQuery(internal.attachments._getAttachment, {
      id: args.id,
    });
    if (!attachment) throw new Error('Attachment not found');
    if (attachment.userId !== userId) throw new Error('Not authorized');

    const client = getR2Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: attachment.storageKey,
      })
    );

    await ctx.runMutation(internal.attachments._removeAttachment, {
      id: args.id,
    });
  },
});
