import * as FileSystem from 'expo-file-system';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

import { Id } from '../../convex/_generated/dataModel';
import { PendingImage } from '../types';
import { useCreateAttachment, useGenerateUploadUrl } from './use-attachments';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

type UploadError = { index: number; message: string };

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<UploadError[]>([]);
  const generateUploadUrl = useGenerateUploadUrl();
  const createAttachment = useCreateAttachment();

  const uploadToR2 = useCallback(
    async (uploadUrl: string, uri: string, contentType: string) => {
      let blob: Blob;
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        blob = await response.blob();
      } else {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: contentType });
      }

      const upload = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
      });
      if (!upload.ok) throw new Error('Upload failed');
    },
    []
  );

  const uploadImages = useCallback(
    async (tradeId: string, images: PendingImage[]) => {
      if (images.length === 0) return;

      setUploading(true);
      setErrors([]);
      const uploadErrors: UploadError[] = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        if (image.size > MAX_FILE_SIZE) {
          uploadErrors.push({ index: i, message: 'File exceeds 5MB limit' });
          continue;
        }
        if (!ALLOWED_TYPES.includes(image.contentType)) {
          uploadErrors.push({
            index: i,
            message: 'Only JPEG and PNG images are supported',
          });
          continue;
        }

        try {
          const { uploadUrl, storageKey } = await generateUploadUrl({
            tradeId: tradeId as Id<'trades'>,
            filename: image.filename,
            contentType: image.contentType,
            fileSize: image.size,
          });

          await uploadToR2(uploadUrl, image.uri, image.contentType);

          await createAttachment({
            tradeId: tradeId as Id<'trades'>,
            storageKey,
            filename: image.filename,
            contentType: image.contentType,
            size: image.size,
          });
        } catch {
          uploadErrors.push({ index: i, message: 'Upload failed' });
        }
      }

      setErrors(uploadErrors);
      setUploading(false);
      return uploadErrors;
    },
    [generateUploadUrl, uploadToR2, createAttachment]
  );

  return { uploadImages, uploading, errors };
}
