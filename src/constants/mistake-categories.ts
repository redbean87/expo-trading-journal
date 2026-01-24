export const MISTAKE_CATEGORIES = [
  {
    id: 'early_exit',
    label: 'Exited Too Early',
    keywords: ['early exit', 'exit early', 'got out early', 'exited too early'],
  },
  {
    id: 'late_exit',
    label: 'Exited Too Late',
    keywords: ['late exit', 'held too long', 'didnt exit', 'exited too late'],
  },
  {
    id: 'no_setup',
    label: 'No Valid Setup',
    keywords: ['no setup', 'not setup', 'no pattern', 'invalid setup'],
  },
  {
    id: 'oversize',
    label: 'Oversized Position',
    keywords: ['oversize', 'too big', 'too much size', 'position too large'],
  },
  {
    id: 'fomo',
    label: 'FOMO Entry',
    keywords: ['fomo', 'chased', 'chasing', 'fear of missing'],
  },
  {
    id: 'revenge',
    label: 'Revenge Trade',
    keywords: ['revenge', 'tilted', 'tilt', 'angry trade'],
  },
  {
    id: 'no_stop',
    label: 'No Stop Loss',
    keywords: ['no stop', 'no stoploss', 'didnt use stop', 'without stop'],
  },
  {
    id: 'moved_stop',
    label: 'Moved Stop Loss',
    keywords: ['moved stop', 'adjusted stop', 'widened stop', 'changed stop'],
  },
  {
    id: 'wrong_direction',
    label: 'Wrong Direction',
    keywords: ['wrong direction', 'wrong side', 'should have been'],
  },
  {
    id: 'poor_timing',
    label: 'Poor Entry Timing',
    keywords: [
      'poor timing',
      'bad entry',
      'entered too early',
      'entered too late',
      'bad timing',
    ],
  },
  {
    id: 'ignored_rules',
    label: 'Ignored Trading Rules',
    keywords: ['ignored rule', 'broke rule', 'violated rule', 'broke my rule'],
  },
  {
    id: 'other',
    label: 'Other',
    keywords: [],
  },
] as const;

export type MistakeCategoryId = (typeof MISTAKE_CATEGORIES)[number]['id'];

export type MistakeCategory = {
  id: MistakeCategoryId;
  label: string;
  keywords: readonly string[];
};

export function getMistakeCategoryLabel(id: MistakeCategoryId): string {
  const category = MISTAKE_CATEGORIES.find((c) => c.id === id);
  return category?.label ?? 'Other';
}
