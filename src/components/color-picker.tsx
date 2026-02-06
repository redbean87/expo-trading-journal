import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

const HEX_PATTERN = /^#[0-9A-F]{6}$/i;

export function ColorPicker({
  label,
  value,
  onChange,
  error,
}: ColorPickerProps) {
  const [localValue, setLocalValue] = useState(value);
  const [localError, setLocalError] = useState<string | undefined>(error);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChangeText = (text: string) => {
    // Auto-format: add # if missing
    let formatted = text.trim();
    if (formatted && !formatted.startsWith('#')) {
      formatted = '#' + formatted;
    }

    // Uppercase for consistency
    formatted = formatted.toUpperCase();

    setLocalValue(formatted);

    // Validate
    if (formatted === '') {
      setLocalError('Color is required');
      return;
    }

    if (!HEX_PATTERN.test(formatted)) {
      setLocalError('Invalid format. Use #RRGGBB (e.g., #4CAF50)');
      return;
    }

    // Valid - update parent
    setLocalError(undefined);
    onChange(formatted);
  };

  const isValid = HEX_PATTERN.test(localValue);
  const previewColor = isValid ? localValue : '#808080';

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <TextInput
            label={label}
            value={localValue}
            onChangeText={handleChangeText}
            maxLength={7}
            placeholder="#4CAF50"
            mode="outlined"
            error={!!localError || !!error}
            autoCapitalize="characters"
          />
        </View>
        <View style={[styles.swatch, { backgroundColor: previewColor }]} />
      </View>
      {(localError || error) && (
        <HelperText type="error" visible>
          {localError || error}
        </HelperText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  swatch: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
});
