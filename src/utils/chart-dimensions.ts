export type ChartType = 'line' | 'bar' | 'calendar';

export type CalendarCellDimensions = {
  cellSize: number;
  availableWidth: number;
};

/** Horizontal padding: content padding (16) + Card.Content padding (16) on each side */
export const CHART_HORIZONTAL_PADDING = 64;

/** Width reserved for Y-axis labels in charts */
export const Y_AXIS_LABEL_WIDTH = 50;

/** Number of columns in calendar grid */
export const CALENDAR_COLUMNS = 7;

/** Gap between calendar cells */
export const CALENDAR_GAP = 4;

/** Default height for line charts (equity curve) */
export const DEFAULT_LINE_CHART_HEIGHT = 180;

/** Desktop height for line charts (equity curve) */
export const DESKTOP_LINE_CHART_HEIGHT = 280;

/** Default height for bar charts (day of week, time of day) */
export const DEFAULT_BAR_CHART_HEIGHT = 160;

/** Desktop height for bar charts (day of week, time of day) */
export const DESKTOP_BAR_CHART_HEIGHT = 220;

/**
 * Calculate chart width for charts with a Y-axis (line, bar).
 * Subtracts horizontal padding and Y-axis label width from content width.
 */
export function getChartWidth(contentWidth: number): number {
  return contentWidth - CHART_HORIZONTAL_PADDING - Y_AXIS_LABEL_WIDTH;
}

/**
 * Calculate available width for full-width elements (no Y-axis).
 * Only subtracts horizontal padding.
 */
export function getAvailableWidth(contentWidth: number): number {
  return contentWidth - CHART_HORIZONTAL_PADDING;
}

/**
 * Calculate calendar cell dimensions.
 * Returns both cell size and available width for flexibility.
 * Accounts for gaps between cells.
 */
export function getCalendarCellSize(
  contentWidth: number
): CalendarCellDimensions {
  const availableWidth = contentWidth - CHART_HORIZONTAL_PADDING;
  const totalGapWidth = CALENDAR_GAP * (CALENDAR_COLUMNS - 1);
  const cellSize = Math.floor(
    (availableWidth - totalGapWidth) / CALENDAR_COLUMNS
  );
  return { cellSize, availableWidth };
}

/**
 * Calculate bar width for day-of-week chart (7 bars).
 * Accounts for spacing between bars.
 */
export function getDayOfWeekBarWidth(chartWidth: number): number {
  const SPACING_TOTAL = 70;
  return Math.floor((chartWidth - SPACING_TOTAL) / 7);
}

/**
 * Get chart height based on chart type and breakpoint.
 * Line and bar charts are taller on desktop for better visibility.
 */
export function getChartHeight(
  chartType: ChartType,
  breakpoint?: 'mobile' | 'tablet' | 'desktop'
): number {
  switch (chartType) {
    case 'line':
      return breakpoint === 'desktop'
        ? DESKTOP_LINE_CHART_HEIGHT
        : DEFAULT_LINE_CHART_HEIGHT;
    case 'bar':
      return breakpoint === 'desktop'
        ? DESKTOP_BAR_CHART_HEIGHT
        : DEFAULT_BAR_CHART_HEIGHT;
    case 'calendar':
      return 0;
    default:
      return DEFAULT_BAR_CHART_HEIGHT;
  }
}
