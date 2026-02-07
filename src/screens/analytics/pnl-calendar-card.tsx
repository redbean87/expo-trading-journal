import React, { useState } from 'react';

import { SectionCard } from '../../components/section-card';
import { DailyPnl, useDailyPnl } from '../../hooks/use-daily-pnl';
import { Trade } from '../../types';
import { CalendarGrid } from './pnl-calendar/calendar-grid';
import { CalendarHeader } from './pnl-calendar/calendar-header';
import { addMonths } from '../../utils/calendar-helpers';

type PnlCalendarCardProps = {
  trades: Trade[];
  onDayPress?: (date: Date, dayData: DailyPnl | undefined) => void;
};

export function PnlCalendarCard({ trades, onDayPress }: PnlCalendarCardProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const dailyPnlData = useDailyPnl(trades);

  const handlePrevMonth = () => {
    setSelectedMonth((prev) => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => addMonths(prev, 1));
  };

  return (
    <SectionCard title="P&L Calendar">
      <CalendarHeader
        selectedMonth={selectedMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      <CalendarGrid
        selectedMonth={selectedMonth}
        dailyPnlData={dailyPnlData}
        onDayPress={onDayPress}
      />
    </SectionCard>
  );
}
