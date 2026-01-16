import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Searchbar, IconButton, Badge } from 'react-native-paper';

import { useAppTheme } from '../hooks/use-app-theme';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  filterCount?: number;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChangeText,
  onFilterPress,
  filterCount = 0,
  placeholder = 'Search symbol or strategy...',
}: SearchBarProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        style={styles.searchbar}
        inputStyle={styles.input}
      />
      <View style={styles.filterButtonContainer}>
        <IconButton
          icon="filter-variant"
          mode="contained"
          onPress={onFilterPress}
          style={styles.filterButton}
        />
        {filterCount > 0 && (
          <Badge style={styles.badge} size={18}>
            {filterCount}
          </Badge>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      gap: 8,
    },
    searchbar: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    input: {
      minHeight: 0,
    },
    filterButtonContainer: {
      position: 'relative',
    },
    filterButton: {
      margin: 0,
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.colors.primary,
    },
  });
