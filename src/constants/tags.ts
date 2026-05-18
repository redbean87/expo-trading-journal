/**
 * System tag definitions for the tag library.
 * These are seeded into Convex on app initialization.
 * Users can disable system tags but cannot delete them.
 */
export const SYSTEM_TAG_DEFINITIONS = {
  strategy: [
    'Key Level Breakout',
    'Pullback (Trend Continuation)',
    'Range Break / Consolidation Break',
    'Reversal',
  ],
  marketCondition: ['Trend', 'Range', 'Choppy', 'High Momentum'],
  htfContext: ['Clear', 'Resistance Above', 'Support Below', 'Range'],
  psychology: [
    'Calm',
    'Confident',
    'Focused',
    'Disciplined',
    'Neutral',
    'Anxious',
    'FOMO',
    'Fear',
    'Greed',
    'Frustrated',
    'Hesitant',
  ],
  ruleViolation: [
    'Exited Too Early',
    'Exited Too Late',
    'No Valid Setup',
    'Oversized Position',
    'FOMO Entry',
    'Revenge Trade',
    'No Stop Loss',
    'Moved Stop Loss',
    'Wrong Direction',
    'Poor Entry Timing',
    'Ignored Trading Rules',
  ],
  whatFailed: [
    'Poor Entry Timing',
    'Chased Move',
    'Late in Move',
    'Entered Into Resistance',
    'Entered Into Support',
    'Range / Choppy Conditions',
    'Weak Volume',
    'No Clear Trend Continuation',
    'No Higher Timeframe Level',
    'Premature Exit (Read Issue)',
    'Held Too Long',
    "Didn't Follow Plan",
  ],
  whatWorked: [
    'Entered on Confirmation',
    'Waited for Pullback',
    'Followed Plan',
    'Good Patience',
    'Strong Momentum Setup',
  ],
} as const;

export type TagField = keyof typeof SYSTEM_TAG_DEFINITIONS;

export const TAG_FIELD_LABELS: Record<TagField, string> = {
  strategy: 'Strategy',
  marketCondition: 'Market Condition',
  htfContext: 'HTF Context',
  psychology: 'Psychology',
  ruleViolation: 'Rule Violation',
  whatFailed: "What Didn't Work",
  whatWorked: 'What Worked',
};
