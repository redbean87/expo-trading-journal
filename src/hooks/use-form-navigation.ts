import { useRef, useCallback, useEffect } from 'react';
import { TextInput as RNTextInput, Platform } from 'react-native';

type UseFormNavigationOptions<T extends string> = {
  fields: readonly T[];
};

type UseFormNavigationReturn<T extends string> = {
  createRef: (field: T) => (el: RNTextInput | null) => void;
  focusField: (field: T) => void;
  focusNext: (currentField: T) => void;
  focusPrevious: (currentField: T) => void;
  getReturnKeyType: (field: T) => 'next' | 'done';
  getBlurOnSubmit: (field: T) => boolean;
  handleSubmitEditing: (field: T) => void;
};

export function useFormNavigation<T extends string>({
  fields,
}: UseFormNavigationOptions<T>): UseFormNavigationReturn<T> {
  const initialRefs = fields.reduce(
    (acc, field) => ({ ...acc, [field]: null }),
    {} as Record<T, RNTextInput | null>
  );
  const refs = useRef<Record<T, RNTextInput | null>>(initialRefs);

  const createRef = useCallback(
    (field: T) => (el: RNTextInput | null) => {
      refs.current[field] = el;
    },
    []
  );

  const focusField = useCallback((field: T) => {
    refs.current[field]?.focus();
  }, []);

  const focusNext = useCallback(
    (currentField: T) => {
      const currentIndex = fields.indexOf(currentField);
      if (currentIndex < fields.length - 1) {
        const nextField = fields[currentIndex + 1];
        refs.current[nextField]?.focus();
      }
    },
    [fields]
  );

  const focusPrevious = useCallback(
    (currentField: T) => {
      const currentIndex = fields.indexOf(currentField);
      if (currentIndex > 0) {
        const prevField = fields[currentIndex - 1];
        refs.current[prevField]?.focus();
      }
    },
    [fields]
  );

  const getReturnKeyType = useCallback(
    (field: T): 'next' | 'done' => {
      const index = fields.indexOf(field);
      return index === fields.length - 1 ? 'done' : 'next';
    },
    [fields]
  );

  const getBlurOnSubmit = useCallback(
    (field: T): boolean => {
      const index = fields.indexOf(field);
      return index === fields.length - 1;
    },
    [fields]
  );

  const handleSubmitEditing = useCallback(
    (field: T) => {
      focusNext(field);
    },
    [focusNext]
  );

  // Web: intercept Tab key in textareas to navigate instead of inserting tab character
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const activeElement = document.activeElement as HTMLElement;
      if (!activeElement) return;

      // Check if we're in a textarea (multiline TextInput)
      if (activeElement.tagName.toLowerCase() !== 'textarea') return;

      // Check if this textarea belongs to our form fields
      const fieldAttr = activeElement.getAttribute('data-form-field');
      if (!fieldAttr || !fields.includes(fieldAttr as T)) return;

      e.preventDefault();
      e.stopPropagation();

      if (e.shiftKey) {
        focusPrevious(fieldAttr as T);
      } else {
        focusNext(fieldAttr as T);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [fields, focusNext, focusPrevious]);

  return {
    createRef,
    focusField,
    focusNext,
    focusPrevious,
    getReturnKeyType,
    getBlurOnSubmit,
    handleSubmitEditing,
  };
}
