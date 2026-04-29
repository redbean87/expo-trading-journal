import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';

import { DatePickerDialog } from './date-picker-dialog';

type DateTimeInputProps = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
};

export function DateTimeInput({ label, value, onChange }: DateTimeInputProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onConfirmDate = useCallback(
    (date: Date) => {
      setShowDatePicker(false);
      const newDate = new Date(date);
      newDate.setHours(value.getHours(), value.getMinutes());
      onChange(newDate);
    },
    [value, onChange]
  );

  const onConfirmTime = useCallback(
    ({ hours, minutes }: { hours: number; minutes: number }) => {
      setShowTimePicker(false);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes);
      onChange(newDate);
    },
    [value, onChange]
  );

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={formatDateTime(value)}
        mode="outlined"
        editable={false}
        style={styles.input}
        right={
          <TextInput.Icon
            icon="calendar"
            onPress={() => setShowDatePicker(true)}
          />
        }
      />
      <IconButton
        icon="clock-outline"
        onPress={() => setShowTimePicker(true)}
      />
      <DatePickerDialog
        visible={showDatePicker}
        date={value}
        onDismiss={() => setShowDatePicker(false)}
        onConfirm={onConfirmDate}
      />
      <TimePickerModal
        visible={showTimePicker}
        onDismiss={() => setShowTimePicker(false)}
        onConfirm={onConfirmTime}
        hours={value.getHours()}
        minutes={value.getMinutes()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
