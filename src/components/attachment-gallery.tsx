import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconButton, Text } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';
import { useGenerateDownloadUrl } from '../hooks/use-attachments';
import { Attachment } from '../types';

type AttachmentGalleryProps = {
  attachments: Attachment[];
};

export function AttachmentGallery({ attachments }: AttachmentGalleryProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const generateDownloadUrl = useGenerateDownloadUrl();

  useEffect(() => {
    attachments.forEach(async (attachment) => {
      if (!downloadUrls[attachment.id]) {
        try {
          const url = await generateDownloadUrl({
            storageKey: attachment.storageKey,
          });
          setDownloadUrls((prev) => ({ ...prev, [attachment.id]: url }));
        } catch {
          // image will show as broken
        }
      }
    });
  }, [attachments, generateDownloadUrl]);

  if (attachments.length === 0) return null;

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.thumbnailRow}
      >
        {attachments.map((attachment, index) => (
          <TouchableOpacity
            key={attachment.id}
            onPress={() => setSelectedIndex(index)}
            style={styles.thumbnailWrapper}
          >
            <Image
              source={{ uri: downloadUrls[attachment.id] ?? '' }}
              style={styles.thumbnail}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={selectedIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedIndex(null)}
      >
        <View style={styles.modalOverlay}>
          <IconButton
            icon="close"
            onPress={() => setSelectedIndex(null)}
            style={styles.closeButton}
            iconColor={theme.colors.onSurface}
            size={28}
          />
          {selectedIndex !== null && (
            <View style={styles.modalContent}>
              <TouchableOpacity
                onPress={() =>
                  setSelectedIndex((prev) =>
                    prev !== null && prev > 0
                      ? prev - 1
                      : attachments.length - 1
                  )
                }
                style={styles.navButton}
              >
                <Text style={styles.navText}>‹</Text>
              </TouchableOpacity>

              <Image
                source={{
                  uri: downloadUrls[attachments[selectedIndex].id] ?? '',
                }}
                style={styles.fullImage}
                resizeMode="contain"
              />

              <TouchableOpacity
                onPress={() =>
                  setSelectedIndex((prev) =>
                    prev !== null && prev < attachments.length - 1
                      ? prev + 1
                      : 0
                  )
                }
                style={styles.navButton}
              >
                <Text style={styles.navText}>›</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.counter}>
            {selectedIndex !== null ? selectedIndex + 1 : 0} /{' '}
            {attachments.length}
          </Text>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    thumbnailRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    thumbnailWrapper: {
      width: 72,
      height: 72,
      borderRadius: 8,
      overflow: 'hidden',
    },
    thumbnail: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: 48,
      right: 16,
      zIndex: 1,
    },
    modalContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      position: 'relative',
    },
    fullImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    navButton: {
      paddingHorizontal: 16,
      paddingVertical: 32,
      zIndex: 1,
    },
    navText: {
      color: theme.colors.onSurface,
      fontSize: 36,
      textShadowColor: theme.colors.background,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    },
    counter: {
      position: 'absolute',
      bottom: 40,
      color: theme.colors.onSurface,
      fontSize: 14,
      opacity: 0.8,
    },
  });
