export const PSYCHOLOGY_OPTIONS = [
  // Positive/optimal states
  'calm',
  'confident',
  'focused',
  'disciplined',
  'analytical',
  'neutral',
  // Negative/challenging states
  'anxious',
  'fomo',
  'fear',
  'panic',
  'greed',
  'overconfident',
  'frustrated',
  'hesitant',
  'depressed',
  'regret',
] as const;

export type PsychologyOption = (typeof PSYCHOLOGY_OPTIONS)[number];
