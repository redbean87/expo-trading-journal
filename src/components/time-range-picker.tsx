import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Dialog, Portal, RadioButton, List } from 'react-native-paper';

import { Button } from './button';
import { useUpdateDefaultTimeRange } from '../hooks/use-settings';
import { useProfileStore } from '../store/profile-store';
import { dateRangeOptions, getDateRangeLabel } from '../utils/date-range';

const DEFAULT_RANGE_OPTIONS = dateRangeOptions.filter(
  (option) => option.value !== 'custom'
);

export function TimeRangePicker() {
  const { defaultTimeRange } = useProfileStore();
  const updateDefaultTimeRange = useUpdateDefaultTimeRange();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState(
    defaultTimeRange ?? 'year'
  );

  const currentLabel = defaultTimeRange
    ? getDateRangeLabel(defaultTimeRange)
    : 'This Year';

  const handleOpen = () => {
    setSelectedValue(defaultTimeRange ?? 'year');
    setDialogVisible(true);
  };

  const handleConfirm = async () => {
    await updateDefaultTimeRange(selectedValue);
    setDialogVisible(false);
  };

  const handleCancel = () => {
    setSelectedValue(defaultTimeRange ?? 'year');
    setDialogVisible(false);
  };

  return (
    <>
      <List.Item
        title="Default Time Period"
        description={currentLabel}
        left={(props) => <List.Icon {...props} icon="calendar" />}
        onPress={handleOpen}
      />
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={handleCancel}
          style={styles.dialog}
        >
          <Dialog.Title>Select Default Time Period</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView>
              <RadioButton.Group
                value={selectedValue}
                onValueChange={(value) =>
                  setSelectedValue(value as typeof selectedValue)
                }
              >
                {DEFAULT_RANGE_OPTIONS.map((option) => (
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
  dialog: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '90%',
  },
  scrollArea: {
    maxHeight: 400,
  },
});
