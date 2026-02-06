import React from 'react';

import { PeriodBreakdownCard } from './period-breakdown-card';
import { Trade } from '../../types';

type TimingSectionProps = {
  trades: Trade[];
};

export function TimingSection({ trades }: TimingSectionProps) {
  return <PeriodBreakdownCard trades={trades} />;
}
