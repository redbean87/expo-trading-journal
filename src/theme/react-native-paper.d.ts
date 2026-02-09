import 'react-native-paper';
import type { customTypography } from './theme';

declare module 'react-native-paper' {
  // Extend MD3Typescale to include custom typography variants
  interface MD3Typescale {
    chartLabel: typeof customTypography.chartLabel;
    chartAxis: typeof customTypography.chartAxis;
    chartValue: typeof customTypography.chartValue;
    profitLarge: typeof customTypography.profitLarge;
    lossLarge: typeof customTypography.lossLarge;
    statValue: typeof customTypography.statValue;
    statLabel: typeof customTypography.statLabel;
    metaText: typeof customTypography.metaText;
    sectionTitle: typeof customTypography.sectionTitle;
  }

  // Extend VariantProp to include custom variants
  type CustomVariant =
    | 'chartLabel'
    | 'chartAxis'
    | 'chartValue'
    | 'profitLarge'
    | 'lossLarge'
    | 'statValue'
    | 'statLabel'
    | 'metaText'
    | 'sectionTitle';

  type VariantProp<_T> = MD3TypescaleKey | CustomVariant;
}

export {};
