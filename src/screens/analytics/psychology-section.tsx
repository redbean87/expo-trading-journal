import React from 'react';

import { MistakesCard } from './mistakes-card';
import { Trade } from '../../types';

type PsychologySectionProps = {
  trades: Trade[];
};

export function PsychologySection({ trades }: PsychologySectionProps) {
  return <MistakesCard trades={trades} />;
}
