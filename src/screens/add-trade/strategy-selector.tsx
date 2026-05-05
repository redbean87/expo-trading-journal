import React from 'react';

import { TagSelector } from '../../components/tag-selector';

type StrategySelectorProps = {
  value: string | undefined;
  onSelect: (value: string) => void;
};

export function StrategySelector({ value, onSelect }: StrategySelectorProps) {
  return (
    <TagSelector
      field="strategy"
      value={value}
      onChange={onSelect}
      mode="single"
      allowCustom
    />
  );
}
