import {
  addMonths,
  formatDateKey,
  formatMonthYear,
  getMonthDays,
  getWeekdayLabels,
  isSameMonth,
  isToday,
} from '../calendar-helpers';

describe('formatDateKey', () => {
  it('should format date as YYYY-MM-DD', () => {
    const date = new Date(2024, 0, 15); // Jan 15, 2024
    expect(formatDateKey(date)).toBe('2024-01-15');
  });

  it('should pad single digit months and days', () => {
    const date = new Date(2024, 4, 5); // May 5, 2024
    expect(formatDateKey(date)).toBe('2024-05-05');
  });

  it('should handle end of year dates', () => {
    const date = new Date(2024, 11, 31); // Dec 31, 2024
    expect(formatDateKey(date)).toBe('2024-12-31');
  });
});

describe('getWeekdayLabels', () => {
  it('should return array of weekday labels starting with Sunday', () => {
    const labels = getWeekdayLabels();
    expect(labels).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  });
});

describe('formatMonthYear', () => {
  it('should format month and year correctly', () => {
    const date = new Date(2024, 0, 15); // January 2024
    const result = formatMonthYear(date);
    expect(result).toMatch(/January/);
    expect(result).toMatch(/2024/);
  });

  it('should format different months correctly', () => {
    const date = new Date(2024, 11, 1); // December 2024
    const result = formatMonthYear(date);
    expect(result).toMatch(/December/);
    expect(result).toMatch(/2024/);
  });
});

describe('isSameMonth', () => {
  it('should return true for same month and year', () => {
    const date1 = new Date(2024, 5, 10);
    const date2 = new Date(2024, 5, 25);
    expect(isSameMonth(date1, date2)).toBe(true);
  });

  it('should return false for different months', () => {
    const date1 = new Date(2024, 5, 10);
    const date2 = new Date(2024, 6, 10);
    expect(isSameMonth(date1, date2)).toBe(false);
  });

  it('should return false for different years', () => {
    const date1 = new Date(2024, 5, 10);
    const date2 = new Date(2025, 5, 10);
    expect(isSameMonth(date1, date2)).toBe(false);
  });
});

describe('isToday', () => {
  it('should return true for today', () => {
    const today = new Date();
    expect(isToday(today)).toBe(true);
  });

  it('should return false for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday)).toBe(false);
  });

  it('should return false for tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isToday(tomorrow)).toBe(false);
  });
});

describe('getMonthDays', () => {
  it('should return 42 days (6 weeks)', () => {
    const days = getMonthDays(2024, 0); // January 2024
    expect(days).toHaveLength(42);
  });

  it('should include padding days from previous month', () => {
    // January 2024 starts on Monday, so should have 1 padding day (Sunday)
    const days = getMonthDays(2024, 0);
    const firstDay = days[0];
    expect(firstDay.getMonth()).toBe(11); // December
    expect(firstDay.getDate()).toBe(31);
  });

  it('should include all days of the current month', () => {
    const days = getMonthDays(2024, 0); // January 2024
    const januaryDays = days.filter((d) => d.getMonth() === 0);
    expect(januaryDays).toHaveLength(31);
  });

  it('should include padding days from next month', () => {
    const days = getMonthDays(2024, 0);
    const lastDay = days[days.length - 1];
    expect(lastDay.getMonth()).toBe(1); // February
  });

  it('should handle February correctly', () => {
    const days = getMonthDays(2024, 1); // February 2024 (leap year)
    const febDays = days.filter((d) => d.getMonth() === 1);
    expect(febDays).toHaveLength(29); // 2024 is a leap year
  });
});

describe('addMonths', () => {
  it('should add months correctly', () => {
    const date = new Date(2024, 5, 15); // June 2024
    const result = addMonths(date, 2);
    expect(result.getMonth()).toBe(7); // August
    expect(result.getFullYear()).toBe(2024);
  });

  it('should subtract months correctly', () => {
    const date = new Date(2024, 5, 15); // June 2024
    const result = addMonths(date, -3);
    expect(result.getMonth()).toBe(2); // March
    expect(result.getFullYear()).toBe(2024);
  });

  it('should handle year rollover when adding', () => {
    const date = new Date(2024, 11, 15); // December 2024
    const result = addMonths(date, 2);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getFullYear()).toBe(2025);
  });

  it('should handle year rollover when subtracting', () => {
    const date = new Date(2024, 1, 15); // February 2024
    const result = addMonths(date, -3);
    expect(result.getMonth()).toBe(10); // November
    expect(result.getFullYear()).toBe(2023);
  });

  it('should not mutate the original date', () => {
    const date = new Date(2024, 5, 15);
    const originalMonth = date.getMonth();
    addMonths(date, 3);
    expect(date.getMonth()).toBe(originalMonth);
  });
});
