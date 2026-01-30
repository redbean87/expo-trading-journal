import { useRouter } from 'expo-router';
import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

function isTypingInInput(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    el.getAttribute('contenteditable') === 'true'
  );
}

/**
 * Hook that registers global keyboard shortcuts for desktop web.
 *
 * Shortcuts:
 * - Alt + N: Navigate to add trade screen
 */
export function useKeyboardShortcuts(): void {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Alt + N: New trade
      if (event.altKey && event.key === 'n') {
        if (isTypingInInput()) return;
        event.preventDefault();
        event.stopPropagation();
        router.push('/add-trade');
      }
    },
    [router]
  );

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // Use capture phase to intercept before browser handles the shortcut
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [handleKeyDown]);
}
