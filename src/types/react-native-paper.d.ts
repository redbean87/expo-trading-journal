import 'react-native-paper';
import type { TextStyle } from 'react-native';

declare module 'react-native-paper' {
  // Extend MD3Typescale so the fonts object accepts custom variant keys.
  // Use customText<T>() from react-native-paper to get a properly-typed
  // Text component for custom variants — VariantProp<T> cannot be overridden
  // via module augmentation since it is a type alias, not an interface.
  interface MD3Typescale {
    chartLabel: TextStyle;
    chartAxis: TextStyle;
    chartValue: TextStyle;
    profitLarge: TextStyle;
    lossLarge: TextStyle;
    statValue: TextStyle;
    statLabel: TextStyle;
    metaText: TextStyle;
    sectionTitle: TextStyle;
  }
}

export {};
