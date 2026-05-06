import React from 'react';

import { TagSelector } from '../../components/tag-selector';

type PsychologySelectorProps = {
  value: string | undefined;
  onChange: (value: string) => void;
};

export function PsychologySelector({
  value,
  onChange,
}: PsychologySelectorProps) {
  return (
    <TagSelector
      field="psychology"
      value={value}
      onChange={onChange}
      mode="multi"
      maxSelections={2}
      allowCustom
    />
  );
}
