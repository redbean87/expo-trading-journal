import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Dialog, Text } from 'react-native-paper';

import { Button } from '../../components/button';
import { ColorPicker } from '../../components/color-picker';

import type { CustomColors } from '../../types';

type CustomColorsDialogProps = {
  visible: boolean;
  onDismiss: () => void;
  initialColors: CustomColors;
  onSave: (colors: CustomColors) => Promise<void>;
  onReset: () => Promise<void>;
};

export function CustomColorsDialog({
  visible,
  onDismiss,
  initialColors,
  onSave,
  onReset,
}: CustomColorsDialogProps) {
  const [tempColors, setTempColors] = useState<CustomColors>(initialColors);
  const [saveLoading, setSaveLoading] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (visible) {
      setTempColors({
        primary: initialColors.primary,
        profit: initialColors.profit,
        loss: initialColors.loss,
        selectedBackground: initialColors.selectedBackground,
        selectedText: initialColors.selectedText,
      });
    }
  }, [visible, initialColors]);

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await onSave(tempColors);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReset = async () => {
    setSaveLoading(true);
    try {
      await onReset();
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
      <Dialog.Title>Customize Colors</Dialog.Title>

      <Dialog.ScrollArea style={styles.scrollArea}>
        <ScrollView style={styles.scrollContent}>
          <Text variant="labelLarge" style={styles.firstSectionLabel}>
            Primary Color
          </Text>
          <ColorPicker
            label="Accent Color"
            value={tempColors.primary}
            onChange={(val) => setTempColors({ ...tempColors, primary: val })}
          />

          <Text variant="labelLarge" style={styles.sectionLabel}>
            Trading Colors
          </Text>
          <ColorPicker
            label="Profit Color"
            value={tempColors.profit}
            onChange={(val) => setTempColors({ ...tempColors, profit: val })}
          />
          <ColorPicker
            label="Loss Color"
            value={tempColors.loss}
            onChange={(val) => setTempColors({ ...tempColors, loss: val })}
          />

          <Text variant="labelLarge" style={styles.sectionLabel}>
            Selected States
          </Text>
          <ColorPicker
            label="Selected Background"
            value={tempColors.selectedBackground}
            onChange={(val) =>
              setTempColors({ ...tempColors, selectedBackground: val })
            }
          />
          <ColorPicker
            label="Selected Text"
            value={tempColors.selectedText}
            onChange={(val) =>
              setTempColors({ ...tempColors, selectedText: val })
            }
          />
        </ScrollView>
      </Dialog.ScrollArea>

      <Dialog.Actions>
        <Button onPress={handleReset} disabled={saveLoading}>
          Reset to Defaults
        </Button>
        <Button onPress={onDismiss} disabled={saveLoading}>
          Cancel
        </Button>
        <Button
          onPress={handleSave}
          loading={saveLoading}
          disabled={saveLoading}
        >
          Save
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '90%',
  },
  scrollArea: {
    maxHeight: 400,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  firstSectionLabel: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 12,
  },
});
