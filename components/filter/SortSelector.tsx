import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';

const SortSelector = ({
  sortOption,
  setSortOption
}) => {

  //const [sortOption, setSortOption] = useState<'Name A-Z' | 'Name Z-A' | 'Country A-Z' | 'Country Z-A' | 'Rating Ascending' | 'Rating Descending' | 'Global Rating Ascending' | 'Global Rating Descending'>('Global Rating Descending');

  return (
    <Picker
      selectedValue={sortOption}
      onValueChange={(value) => setSortOption(value)}
      style={styles.picker}
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

const styles = StyleSheet.create({
  picker: {
    width: '30%',
    flex: 1,
    marginRight: 20,
    color: '#333',
  },
})

export default SortSelector;