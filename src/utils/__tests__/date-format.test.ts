import { formatDate, formatDateTime } from '../date-format';

describe('formatDate', () => {
  it('should format date correctly', () => {
    // Use local date constructor to avoid timezone issues
    const date = new Date(2024, 0, 15, 10, 30, 0); // Jan 15, 2024, 10:30 AM local
    const result = formatDate(date);

    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2024/);
  });

  it('should handle different dates', () => {
    const date = new Date(2024, 11, 25, 12, 0, 0); // Dec 25, 2024 local
    const result = formatDate(date);

    expect(result).toMatch(/Dec/);
    expect(result).toMatch(/25/);
    expect(result).toMatch(/2024/);
  });

  it('should format different months correctly', () => {
    const dates = [
      { date: new Date(2024, 2, 1), expected: 'Mar' }, // March (month index 2)
      { date: new Date(2024, 5, 15), expected: 'Jun' }, // June
      { date: new Date(2024, 8, 30), expected: 'Sep' }, // September
      { date: new Date(2024, 10, 11), expected: 'Nov' }, // November
    ];

    dates.forEach(({ date, expected }) => {
      expect(formatDate(date)).toContain(expected);
    });
  });
});

describe('formatDateTime', () => {
  it('should format date and time correctly', () => {
    const date = new Date(2024, 0, 15, 14, 30, 0); // Jan 15, 2024, 2:30 PM
    const result = formatDateTime(date);

    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/:\d{2}/);
  });

  it('should include hours and minutes', () => {
    const date = new Date(2024, 5, 20, 9, 5, 0); // Jun 20, 2024, 9:05 AM
    const result = formatDateTime(date);

    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/20/);
    expect(result).toMatch(/9/);
    expect(result).toMatch(/:05/);
  });

  it('should handle midnight correctly', () => {
    const date = new Date(2024, 0, 1, 0, 0, 0); // Jan 1, 2024, 12:00 AM
    const result = formatDateTime(date);

    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/1/);
    expect(result).toMatch(/12/);
    expect(result).toMatch(/:00/);
  });

  it('should handle noon correctly', () => {
    const date = new Date(2024, 6, 4, 12, 0, 0); // Jul 4, 2024, 12:00 PM
    const result = formatDateTime(date);

    expect(result).toMatch(/Jul/);
    expect(result).toMatch(/4/);
    expect(result).toMatch(/12/);
    expect(result).toMatch(/:00/);
  });

  it('should format PM times correctly', () => {
    const date = new Date(2024, 7, 15, 18, 45, 0); // Aug 15, 2024, 6:45 PM
    const result = formatDateTime(date);

    expect(result).toMatch(/Aug/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/6/);
    expect(result).toMatch(/:45/);
  });
});
