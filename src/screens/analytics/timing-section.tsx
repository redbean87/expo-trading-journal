import React from 'react';

import { PeriodBreakdownCard } from './period-breakdown-card';
import { Trade } from '../../types';

type TimingSectionProps = {
  trades: Trade[];
};

export function TimingSection({ trades }: TimingSectionProps) {
  if (trades.length === 0) {
    return null;
  }

  return <PeriodBreakdownCard trades={trades} />;
}
