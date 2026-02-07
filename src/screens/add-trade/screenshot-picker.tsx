import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Menu, Text } from 'react-native-paper';

import { Id } from '../../../convex/_generated/dataModel';
import { AttachmentThumbnail } from '../../components/attachment-thumbnail';
import { useAppTheme } from '../../hooks/use-app-theme';
import {
  useAttachments,
  useDeleteAttachment,
  useGenerateDownloadUrl,
} from '../../hooks/use-attachments';
import { useImagePicker } from '../../hooks/use-image-picker';
import { Attachment, PendingImage } from '../../types';

type ScreenshotPickerProps = {
  tradeId: string | null;
  pendingImages: PendingImage[];
  onPendingImagesChange: (images: PendingImage[]) => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function ScreenshotPicker({
  tradeId,
  pendingImages,
  onPendingImagesChange,
}: ScreenshotPickerProps) {
  const theme = useAppTheme();
  const themedStyles = createThemedStyles(theme);
  const [menuVisible, setMenuVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({});

  const { attachments } = useAttachments(tradeId);
  const deleteAttachment = useDeleteAttachment();
  const generateDownloadUrl = useGenerateDownloadUrl();
  const { pickFromLibrary, pickFromCamera } = useImagePicker();

  // Fetch presigned download URLs for existing attachments
  useEffect(() => {
    attachments.forEach(async (attachment: Attachment) => {
      if (!downloadUrls[attachment.id]) {
        try {
          const url = await generateDownloadUrl({
            storageKey: attachment.storageKey,
          });
          setDownloadUrls((prev) => ({ ...prev, [attachment.id]: url }));
        } catch {
          // silently fail — image will show as broken
        }
      }
    });
  }, [attachments, generateDownloadUrl]);

  const handlePick = useCallback(
    async (source: 'library' | 'camera') => {
      setMenuVisible(false);
      setError(null);
      try {
        const image =
          source === 'camera'
            ? await pickFromCamera()
            : await pickFromLibrary();
        if (!image) return;

        if (image.size > MAX_FILE_SIZE) {
          setError('Screenshot exceeds 5MB limit');
          return;
        }
        if (!['image/jpeg', 'image/png'].includes(image.contentType)) {
          setError('Only JPEG and PNG images are supported');
          return;
        }

        onPendingImagesChange([...pendingImages, image]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to pick image');
      }
    },
    [pendingImages, onPendingImagesChange, pickFromLibrary, pickFromCamera]
  );

  const handleDeleteExisting = useCallback(
    async (id: string) => {
      try {
        await deleteAttachment({ id: id as Id<'attachments'> });
        setDownloadUrls((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } catch {
        setError('Failed to delete screenshot');
      }
    },
    [deleteAttachment]
  );

  const handleRemovePending = useCallback(
    (index: number) => {
      onPendingImagesChange(pendingImages.filter((_, i) => i !== index));
    },
    [pendingImages, onPendingImagesChange]
  );

  const hasImages = attachments.length > 0 || pendingImages.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={themedStyles.sectionTitle}>
          Screenshots
        </Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="plus-circle"
              onPress={() => setMenuVisible(true)}
              iconColor={theme.colors.primary}
              size={24}
            />
          }
        >
          <Menu.Item
            onPress={() => handlePick('library')}
            title="Choose from Library"
            leadingIcon="image"
          />
          <Menu.Item
            onPress={() => handlePick('camera')}
            title="Take Photo"
            leadingIcon="camera"
          />
        </Menu>
      </View>

      {error && (
        <Text variant="bodySmall" style={{ color: theme.colors.loss }}>
          {error}
        </Text>
      )}

      {hasImages && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailRow}
        >
          {attachments.map((attachment: Attachment) => (
            <AttachmentThumbnail
              key={attachment.id}
              uri={downloadUrls[attachment.id] ?? ''}
              onDelete={() => handleDeleteExisting(attachment.id)}
            />
          ))}
          {pendingImages.map((image, index) => (
            <AttachmentThumbnail
              key={`pending-${index}`}
              uri={image.uri}
              onDelete={() => handleRemovePending(index)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const createThemedStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    sectionTitle: {
      color: theme.colors.primary,
    },
  });

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thumbnailRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
});
