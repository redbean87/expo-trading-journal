import { Paths } from 'expo-file-system';
import { File } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export type DownloadResult = {
  success: boolean;
  error?: string;
};

async function downloadForWeb(
  content: string,
  filename: string,
  mimeType: string
): Promise<DownloadResult> {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed',
    };
  }
}

async function shareForNative(
  content: string,
  filename: string,
  mimeType: string
): Promise<DownloadResult> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return {
        success: false,
        error: 'Sharing is not available on this device',
      };
    }

    const fileUri = Paths.cache.uri + '/' + filename;
    const file = new File(fileUri);
    await file.create();
    await file.write(content);

    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle: 'Export Trades',
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Share failed',
    };
  }
}

export async function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/csv'
): Promise<DownloadResult> {
  if (Platform.OS === 'web') {
    return downloadForWeb(content, filename, mimeType);
  }
  return shareForNative(content, filename, mimeType);
}
