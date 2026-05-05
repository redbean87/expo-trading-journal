import { useEffect } from 'react';

import { useEnsureSystemTags, useHasSystemTags } from '../hooks/use-tags';

export function TagLibraryInitializer() {
  const { hasSystemTags, isLoading } = useHasSystemTags();
  const ensureSystemTags = useEnsureSystemTags();

  useEffect(() => {
    if (!isLoading && !hasSystemTags) {
      ensureSystemTags().catch((error) => {
        console.error('Failed to seed system tags:', error);
      });
    }
  }, [isLoading, hasSystemTags, ensureSystemTags]);

  return null;
}
