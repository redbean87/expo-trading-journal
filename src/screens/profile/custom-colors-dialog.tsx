import { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { Dialog, Text, Button, Portal } from 'react-native-paper';

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
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Customize Colors</Dialog.Title>

        <Dialog.ScrollArea style={{ maxHeight: 400 }}>
          <ScrollView style={{ paddingHorizontal: 24 }}>
            <Text
              variant="labelLarge"
              style={{ marginTop: 8, marginBottom: 12 }}
            >
              Primary Color
            </Text>
            <ColorPicker
              label="Accent Color"
              value={tempColors.primary}
              onChange={(val) => setTempColors({ ...tempColors, primary: val })}
            />

            <Text
              variant="labelLarge"
              style={{ marginTop: 16, marginBottom: 12 }}
            >
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
    </Portal>
  );
}
