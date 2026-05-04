export const HTF_CONTEXTS = [
  'Clear',
  'Resistance Above',
  'Support Below',
  'Range',
] as const;

export type HtfContext = (typeof HTF_CONTEXTS)[number];
