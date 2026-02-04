import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';

type AttachmentThumbnailProps = {
  uri: string;
  onPress?: () => void;
  onDelete?: () => void;
  uploading?: boolean;
};

export function AttachmentThumbnail({
  uri,
  onPress,
  onDelete,
  uploading = false,
}: AttachmentThumbnailProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress || uploading}
        style={styles.imageWrapper}
      >
        <Image source={{ uri }} style={styles.image} />
        {uploading && (
          <View style={styles.overlay}>
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        )}
      </TouchableOpacity>
      {onDelete && !uploading && (
        <IconButton
          icon="close-circle"
          size={18}
          onPress={onDelete}
          style={styles.deleteButton}
          iconColor={theme.colors.onError}
          containerColor={theme.colors.error}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  uploadingText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  deleteButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    margin: 0,
  },
});
