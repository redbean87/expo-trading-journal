import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { PendingImage } from '../types';

export function useImagePicker() {
  const pickFromLibrary = async (): Promise<PendingImage | null> => {
    if (Platform.OS !== 'web') {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Media library permission denied');
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (result.canceled) return null;

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      filename: asset.fileName ?? `screenshot-${Date.now()}.jpg`,
      contentType: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize ?? 0,
    };
  };

  const pickFromCamera = async (): Promise<PendingImage | null> => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera permission denied');
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled) return null;

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      filename: asset.fileName ?? `screenshot-${Date.now()}.jpg`,
      contentType: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize ?? 0,
    };
  };

  return { pickFromLibrary, pickFromCamera };
}
