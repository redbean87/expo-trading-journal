import 'react-native-paper';
import type { TextStyle } from 'react-native';

declare module 'react-native-paper' {
  // Define custom variant names
  type CustomVariantName =
    | 'chartLabel'
    | 'chartAxis'
    | 'chartValue'
    | 'profitLarge'
    | 'lossLarge'
    | 'statValue'
    | 'statLabel'
    | 'metaText'
    | 'sectionTitle';

  // Extend the MD3Typescale interface
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

  // Override VariantProp to include custom variants
  type VariantProp<_T> =
    | import('react-native-paper').MD3TypescaleKey
    | CustomVariantName;
}

export {};
