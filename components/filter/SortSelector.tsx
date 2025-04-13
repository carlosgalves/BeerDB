import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  useColorScheme
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '@/constants/Colors';

const SortSelector = ({
  sortOption,
  setSortOption
}) => {

  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = getStyles(theme);

  return (
    <Picker
      selectedValue={sortOption}
      onValueChange={(value) => setSortOption(value)}
      style={styles.picker}
      mode="dropdown"
    >
      <Picker.Item label="Rating ↓" value="Rating Descending" />
      <Picker.Item label="Rating ↑" value="Rating Ascending" />
      <Picker.Item label="Global Rating ↓" value="Global Rating Descending" />
      <Picker.Item label="Global Rating ↑" value="Global Rating Ascending" />
      <Picker.Item label="Name A-Z" value="Name A-Z" />
      <Picker.Item label="Name Z-A" value="Name Z-A" />
      <Picker.Item label="Country A-Z" value="Country A-Z" />
      <Picker.Item label="Country Z-A" value="Country Z-A" />
    </Picker>
  )

}

const getStyles = (theme: typeof Colors.light | typeof Colors.dark) => StyleSheet.create({
  picker: {
    flex: 1,
    marginRight: 20,
    color: theme.text,
  },
})

export default SortSelector;