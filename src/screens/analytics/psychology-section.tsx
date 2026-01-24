import React from 'react';

import { MistakesCard } from './mistakes-card';
import { Trade } from '../../types';

type PsychologySectionProps = {
  trades: Trade[];
};

export function PsychologySection({ trades }: PsychologySectionProps) {
  if (trades.length === 0) {
    return null;
  }

  return <MistakesCard trades={trades} />;
}
