import {
  CHART_HORIZONTAL_PADDING,
  Y_AXIS_LABEL_WIDTH,
  CALENDAR_COLUMNS,
  DEFAULT_LINE_CHART_HEIGHT,
  DEFAULT_BAR_CHART_HEIGHT,
  getChartWidth,
  getAvailableWidth,
  getCalendarCellSize,
  getDayOfWeekBarWidth,
  getChartHeight,
} from '../chart-dimensions';

describe('chart-dimensions constants', () => {
  it('should export correct padding constant', () => {
    expect(CHART_HORIZONTAL_PADDING).toBe(64);
  });

  it('should export correct Y-axis label width', () => {
    expect(Y_AXIS_LABEL_WIDTH).toBe(50);
  });

  it('should export correct calendar columns', () => {
    expect(CALENDAR_COLUMNS).toBe(7);
  });

  it('should export correct default chart heights', () => {
    expect(DEFAULT_LINE_CHART_HEIGHT).toBe(180);
    expect(DEFAULT_BAR_CHART_HEIGHT).toBe(160);
  });
});

describe('getChartWidth', () => {
  it('should subtract padding and Y-axis width from content width', () => {
    const contentWidth = 400;
    const expected = 400 - 64 - 50; // 286
    expect(getChartWidth(contentWidth)).toBe(expected);
  });

  it('should handle various screen sizes', () => {
    expect(getChartWidth(320)).toBe(206); // mobile
    expect(getChartWidth(768)).toBe(654); // tablet
    expect(getChartWidth(1200)).toBe(1086); // desktop max width
  });
});

describe('getAvailableWidth', () => {
  it('should subtract only horizontal padding', () => {
    const contentWidth = 400;
    const expected = 400 - 64; // 336
    expect(getAvailableWidth(contentWidth)).toBe(expected);
  });

  it('should handle various screen sizes', () => {
    expect(getAvailableWidth(320)).toBe(256);
    expect(getAvailableWidth(768)).toBe(704);
    expect(getAvailableWidth(1200)).toBe(1136);
  });
});

describe('getCalendarCellSize', () => {
  it('should return floored cell size for 7 columns', () => {
    const contentWidth = 400;
    const availableWidth = 400 - 64; // 336
    const expectedCellSize = Math.floor(336 / 7); // 48

    const result = getCalendarCellSize(contentWidth);
    expect(result.cellSize).toBe(expectedCellSize);
    expect(result.availableWidth).toBe(availableWidth);
  });

  it('should floor the cell size correctly', () => {
    // 320 - 64 = 256, 256 / 7 = 36.57... -> 36
    const result = getCalendarCellSize(320);
    expect(result.cellSize).toBe(36);
  });

  it('should handle various screen sizes', () => {
    expect(getCalendarCellSize(320).cellSize).toBe(36);
    expect(getCalendarCellSize(768).cellSize).toBe(100);
    expect(getCalendarCellSize(1200).cellSize).toBe(162);
  });
});

describe('getDayOfWeekBarWidth', () => {
  it('should calculate bar width for 7 bars with spacing', () => {
    const chartWidth = 300;
    const expected = Math.floor((300 - 70) / 7); // 32
    expect(getDayOfWeekBarWidth(chartWidth)).toBe(expected);
  });

  it('should floor the bar width correctly', () => {
    // (200 - 70) / 7 = 18.57... -> 18
    expect(getDayOfWeekBarWidth(200)).toBe(18);
  });

  it('should handle various chart widths', () => {
    expect(getDayOfWeekBarWidth(206)).toBe(19); // mobile chart width
    expect(getDayOfWeekBarWidth(654)).toBe(83); // tablet chart width
  });
});

describe('getChartHeight', () => {
  it('should return correct height for line charts', () => {
    expect(getChartHeight('line')).toBe(180);
  });

  it('should return correct height for bar charts', () => {
    expect(getChartHeight('bar')).toBe(160);
  });

  it('should return 0 for calendar (height derived from cells)', () => {
    expect(getChartHeight('calendar')).toBe(0);
  });

  it('should return taller height for line charts on desktop', () => {
    expect(getChartHeight('line', 'mobile')).toBe(180);
    expect(getChartHeight('line', 'tablet')).toBe(180);
    expect(getChartHeight('line', 'desktop')).toBe(280);
  });
});
