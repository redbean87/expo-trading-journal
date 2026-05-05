import React from 'react';

import { TagSelector } from '../../components/tag-selector';

type HtfContextSelectorProps = {
  value?: string;
  onSelect: (context: string | undefined) => void;
};

export function HtfContextSelector({
  value,
  onSelect,
}: HtfContextSelectorProps) {
  return (
    <TagSelector
      field="htfContext"
      value={value}
      onChange={(val) => onSelect(val || undefined)}
      mode="single"
      allowCustom={false}
    />
  );
}
