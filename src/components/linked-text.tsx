import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform, StyleProp, StyleSheet, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';
import { normalizeUrl, parseTextWithUrls } from '../utils/url-detection';

type TextVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall';

type LinkedTextProps = {
  children: string;
  variant?: TextVariant;
  style?: StyleProp<TextStyle>;
};

export function LinkedText({ children, variant, style }: LinkedTextProps) {
  const theme = useAppTheme();
  const segments = parseTextWithUrls(children);

  const handleLinkPress = (url: string) => {
    const normalizedUrl = normalizeUrl(url);
    if (Platform.OS === 'web') {
      window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
    } else {
      WebBrowser.openBrowserAsync(normalizedUrl);
    }
  };

  if (segments.length === 1 && segments[0].type === 'text') {
    return (
      <Text variant={variant} style={style}>
        {children}
      </Text>
    );
  }

  return (
    <Text variant={variant} style={style}>
      {segments.map((segment, index) =>
        segment.type === 'url' ? (
          <Text
            key={index}
            style={[styles.link, { color: theme.colors.primary }]}
            onPress={() => handleLinkPress(segment.content)}
          >
            {segment.content}
          </Text>
        ) : (
          <React.Fragment key={index}>{segment.content}</React.Fragment>
        )
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
  },
});
