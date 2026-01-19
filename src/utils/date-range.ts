export type DateRangePreset =
  | 'all'
  | 'current_week'
  | 'current_month'
  | 'current_year'
  | 'last_30_days'
  | 'last_60_days'
  | 'last_90_days';

export type DateRangeOption = {
  label: string;
  value: DateRangePreset;
};

export const dateRangeOptions: DateRangeOption[] = [
  { label: 'All Time', value: 'all' },
  { label: 'This Week', value: 'current_week' },
  { label: 'This Month', value: 'current_month' },
  { label: 'This Year', value: 'current_year' },
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'Last 60 Days', value: 'last_60_days' },
  { label: 'Last 90 Days', value: 'last_90_days' },
];

export function getDateRangeStart(preset: DateRangePreset): number | null {
  if (preset === 'all') return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'current_week': {
      const dayOfWeek = today.getDay();
      // Start week on Monday (adjust Sunday from 0 to 7)
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - daysFromMonday);
      return monday.getTime();
    }
    case 'current_month':
      return new Date(today.getFullYear(), today.getMonth(), 1).getTime();
    case 'current_year':
      return new Date(today.getFullYear(), 0, 1).getTime();
    case 'last_30_days': {
      const date = new Date(today);
      date.setDate(today.getDate() - 29);
      return date.getTime();
    }
    case 'last_60_days': {
      const date = new Date(today);
      date.setDate(today.getDate() - 59);
      return date.getTime();
    }
    case 'last_90_days': {
      const date = new Date(today);
      date.setDate(today.getDate() - 89);
      return date.getTime();
    }
    default:
      return null;
  }
}
