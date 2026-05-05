import React from 'react';

import { TagSelector } from '../../components/tag-selector';

type WhatWorkedSelectorProps = {
  value: string | undefined;
  onChange: (value: string) => void;
};

export function WhatWorkedSelector({
  value,
  onChange,
}: WhatWorkedSelectorProps) {
  return (
    <TagSelector
      field="whatWorked"
      value={value}
      onChange={onChange}
      mode="multi"
      allowCustom
    />
  );
}
