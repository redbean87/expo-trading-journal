// Platform selector file
// Metro bundler automatically resolves:
// - line-chart.native.tsx for iOS/Android
// - line-chart.web.tsx for web
//
// This file serves as the default/fallback for TypeScript

export { LineChart } from './line-chart.native';
