import { useAction, useMutation, useQuery } from 'convex/react';

import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Attachment } from '../types';

type BackendAttachment = {
  id: Id<'attachments'>;
  storageKey: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: number;
};

function mapToAttachment(a: BackendAttachment): Attachment {
  return {
    id: a.id,
    storageKey: a.storageKey,
    filename: a.filename,
    contentType: a.contentType,
    size: a.size,
    uploadedAt: a.uploadedAt,
  };
}

export function useAttachments(tradeId: string | null) {
  const data = useQuery(
    api.attachments.getAttachmentsByTrade,
    tradeId ? { tradeId: tradeId as Id<'trades'> } : 'skip'
  );

  return {
    attachments: data?.map(mapToAttachment) ?? [],
    isLoading: data === undefined && tradeId !== null,
  };
}

export function useGenerateUploadUrl() {
  return useAction(api.attachments.generateUploadUrl);
}

export function useCreateAttachment() {
  return useMutation(api.attachments.createAttachment);
}

export function useGenerateDownloadUrl() {
  return useAction(api.attachments.generateDownloadUrl);
}

export function useDeleteAttachment() {
  return useAction(api.attachments.deleteAttachment);
}
