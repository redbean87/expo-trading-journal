import React from 'react';

import { TagSelector } from '../../components/tag-selector';

type MistakeCategorySelectorProps = {
  value: string | undefined;
  onSelect: (value: string) => void;
};

export function MistakeCategorySelector({
  value,
  onSelect,
}: MistakeCategorySelectorProps) {
  return (
    <TagSelector
      field="ruleViolation"
      value={value}
      onChange={onSelect}
      mode="single"
      allowCustom={false}
    />
  );
}
