import React from 'react';

import { TagSelector } from '../../components/tag-selector';

type MarketConditionSelectorProps = {
  value?: string;
  onSelect: (condition: string | undefined) => void;
};

export function MarketConditionSelector({
  value,
  onSelect,
}: MarketConditionSelectorProps) {
  return (
    <TagSelector
      field="marketCondition"
      value={value}
      onChange={(val) => onSelect(val || undefined)}
      mode="single"
      allowCustom={false}
    />
  );
}
