import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Dialog, Portal, RadioButton, Button, List } from 'react-native-paper';

import { TIMEZONE_OPTIONS, useTimezoneStore } from '../store/timezone-store';

export function TimezonePicker() {
  const { timezone, setTimezone } = useTimezoneStore();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState(timezone);

  const currentLabel =
    TIMEZONE_OPTIONS.find((opt) => opt.value === timezone)?.label || timezone;

  const handleOpen = () => {
    setSelectedValue(timezone);
    setDialogVisible(true);
  };

  const handleConfirm = () => {
    setTimezone(selectedValue);
    setDialogVisible(false);
  };

  const handleCancel = () => {
    setSelectedValue(timezone);
    setDialogVisible(false);
  };

  return (
    <>
      <List.Item
        title="Trade Timezone"
        description={currentLabel}
        left={(props) => <List.Icon {...props} icon="clock-outline" />}
        onPress={handleOpen}
      />
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={handleCancel}>
          <Dialog.Title>Select Timezone</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView>
              <RadioButton.Group
                value={selectedValue}
                onValueChange={setSelectedValue}
              >
                {TIMEZONE_OPTIONS.map((option) => (
                  <RadioButton.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={handleCancel}>Cancel</Button>
            <Button onPress={handleConfirm}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    maxHeight: 300,
  },
});
