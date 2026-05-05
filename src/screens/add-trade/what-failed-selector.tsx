import React from 'react';

import { TagSelector } from '../../components/tag-selector';

type WhatFailedSelectorProps = {
  value: string | undefined;
  onChange: (value: string) => void;
};

export function WhatFailedSelector({
  value,
  onChange,
}: WhatFailedSelectorProps) {
  return (
    <TagSelector
      field="whatFailed"
      value={value}
      onChange={onChange}
      mode="multi"
      maxSelections={2}
      allowCustom
    />
  );
}
