import { useEffect } from 'react';

import { useSyncSystemTags } from '../hooks/use-tags';

export function TagLibraryInitializer() {
  const syncSystemTags = useSyncSystemTags();

  useEffect(() => {
    syncSystemTags().catch((error) => {
      console.error('Failed to sync system tags:', error);
    });
  }, [syncSystemTags]);

  return null;
}
