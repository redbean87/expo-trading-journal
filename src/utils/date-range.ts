export type DateRangePreset =
  | 'all'
  | 'today'
  | 'week'
  | 'month'
  | 'year'
  | 'custom';

export type DateRangeOption = {
  label: string;
  value: DateRangePreset;
};

export const dateRangeOptions: DateRangeOption[] = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'Date Range', value: 'custom' },
];

export function getDateRangeStart(preset: DateRangePreset): number | null {
  if (preset === 'all' || preset === 'custom') return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return today.getTime();
    case 'week': {
      const dayOfWeek = today.getDay();
      // Start week on Monday (adjust Sunday from 0 to 7)
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - daysFromMonday);
      return monday.getTime();
    }
    case 'month':
      return new Date(today.getFullYear(), today.getMonth(), 1).getTime();
    case 'year':
      return new Date(today.getFullYear(), 0, 1).getTime();
    default:
      return null;
  }
}
