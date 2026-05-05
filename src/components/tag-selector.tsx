import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Portal, Dialog, TextInput } from 'react-native-paper';

import { Button } from './button';
import { Chip } from './chip';
import { TagField, TAG_FIELD_LABELS } from '../constants/tags';
import { useAppTheme } from '../hooks/use-app-theme';
import { useTags, useAddTag, useDisableTag } from '../hooks/use-tags';

export type TagSelectorProps = {
  field: TagField;
  value: string | undefined;
  onChange: (value: string) => void;
  mode: 'single' | 'multi';
  maxSelections?: number;
  allowCustom?: boolean;
};

function parseSelected(value: string | undefined): Set<string> {
  if (!value) return new Set();
  return new Set(
    value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

function serializeSelected(selected: Set<string>): string {
  return Array.from(selected).join(',');
}

export function TagSelector({
  field,
  value,
  onChange,
  mode,
  maxSelections,
  allowCustom = false,
}: TagSelectorProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { tags, isLoading } = useTags(field);
  const addTag = useAddTag();
  const disableTag = useDisableTag();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [disableConfirmVisible, setDisableConfirmVisible] = useState(false);
  const [tagToDisable, setTagToDisable] = useState<string | null>(null);

  const selected = parseSelected(value);
  const label = TAG_FIELD_LABELS[field];

  const handleToggle = useCallback(
    (tagLabel: string) => {
      if (mode === 'single') {
        onChange(selected.has(tagLabel) ? '' : tagLabel);
        return;
      }

      const next = new Set(selected);
      if (next.has(tagLabel)) {
        next.delete(tagLabel);
      } else {
        next.add(tagLabel);
      }
      onChange(serializeSelected(next));
    },
    [mode, selected, onChange]
  );

  const handleAddTag = async () => {
    const trimmed = newTagLabel.trim();
    if (!trimmed) return;

    await addTag(field, trimmed);
    setNewTagLabel('');
    setDialogVisible(false);

    // Auto-select the newly created tag
    if (mode === 'single') {
      onChange(trimmed);
    } else {
      const next = new Set(selected);
      next.add(trimmed);
      onChange(serializeSelected(next));
    }
  };

  const handleLongPress = (tagId: string) => {
    setTagToDisable(tagId);
    setDisableConfirmVisible(true);
  };

  const handleDisableConfirm = async () => {
    if (tagToDisable) {
      await disableTag(tagToDisable);
    }
    setDisableConfirmVisible(false);
    setTagToDisable(null);
  };

  const showWarning =
    maxSelections !== undefined && selected.size > maxSelections;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text variant="bodySmall" style={styles.label}>
          {label} (Loading...)
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <Text variant="bodySmall" style={styles.label}>
          {label} (Optional)
          {mode === 'multi' && selected.size > 0 && (
            <Text style={styles.count}> ({selected.size})</Text>
          )}
        </Text>

        <View style={styles.chipGrid}>
          {tags.map((tag) => (
            <Pressable
              key={tag.id}
              onLongPress={() => handleLongPress(tag.id)}
              delayLongPress={500}
            >
              <Chip
                selected={selected.has(tag.label)}
                onPress={() => handleToggle(tag.label)}
                style={styles.chip}
                compact
              >
                {tag.label}
              </Chip>
            </Pressable>
          ))}

          {allowCustom && (
            <Chip
              onPress={() => setDialogVisible(true)}
              style={[styles.chip, styles.addChip]}
              compact
              icon="plus"
            >
              Add
            </Chip>
          )}
        </View>

        {showWarning && (
          <Text variant="bodySmall" style={styles.warning}>
            Consider limiting to {maxSelections} selections for clearer analysis
          </Text>
        )}
      </View>

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => {
            setDialogVisible(false);
            setNewTagLabel('');
          }}
          style={styles.dialog}
        >
          <Dialog.Title>Add {label}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Tag name"
              value={newTagLabel}
              onChangeText={setNewTagLabel}
              mode="outlined"
              autoFocus
              style={styles.dialogInput}
            />
            {tags.some(
              (t) => t.label.toLowerCase() === newTagLabel.toLowerCase().trim()
            ) && (
              <Text variant="bodySmall" style={styles.existsWarning}>
                This tag already exists
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setDialogVisible(false);
                setNewTagLabel('');
              }}
            >
              Cancel
            </Button>
            <Button
              onPress={handleAddTag}
              disabled={
                !newTagLabel.trim() ||
                tags.some(
                  (t) =>
                    t.label.toLowerCase() === newTagLabel.toLowerCase().trim()
                )
              }
            >
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={disableConfirmVisible}
          onDismiss={() => setDisableConfirmVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Disable Tag</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This tag will be hidden from the selector. Existing trades using
              this tag will still display it.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDisableConfirmVisible(false)}>
              Cancel
            </Button>
            <Button onPress={handleDisableConfirm}>Disable</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      marginBottom: theme.spacing.sm,
      opacity: 0.7,
    },
    count: {
      opacity: 0.5,
    },
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    chip: {
      marginBottom: theme.spacing.xs,
    },
    addChip: {
      borderStyle: 'dashed',
    },
    warning: {
      marginTop: theme.spacing.sm,
      color: theme.colors.primary,
      fontStyle: 'italic',
    },
    dialog: {
      maxWidth: 400,
      alignSelf: 'center',
    },
    dialogInput: {
      backgroundColor: theme.colors.surface,
    },
    existsWarning: {
      marginTop: theme.spacing.sm,
      color: theme.colors.error,
    },
  });
