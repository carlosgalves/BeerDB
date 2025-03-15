import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ActiveFilterList = ({
  filters,
  setFilters
}) => {
  const handleRemoveFilter = useCallback((filterToRemove) => {
    setFilters((prevFilters) => prevFilters.filter(filter =>
      !(filter.type === filterToRemove.type && filter.value === filterToRemove.value)
    ));
  }, [setFilters]);

  const clearAllFilters = () => {
    setFilters([]);
  };

  if (filters.length === 0) {
    return null;
  }

  return (
    <View style={styles.activeFiltersContainer}>
      <View style={styles.activeFiltersHeader}>
        <Text style={styles.activeFiltersTitle}>Active Filters:</Text>
        <Pressable onPress={clearAllFilters} style={styles.clearAllButton}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersContent}>
        {filters.map((filter, index) => (
          <View key={index} style={styles.activeFilterChip}>
            <Text style={styles.activeFilterText}>
              {filter.type === 'country' ? 'Country: ' :
               filter.type === 'brewery' ? 'Brewery: ' :
               'Type: '}
              {filter.displayValue}
            </Text>
            <Pressable onPress={() => handleRemoveFilter(filter)}>
              <Icon name="close-circle" size={16} color="#666" />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  )

}

const styles = StyleSheet.create({
  activeFiltersContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  activeFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeFiltersTitle: {
    fontSize: 14,
  },
  clearAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllText: {
    color: 'red',
    fontSize: 14,
  },
  activeFiltersContent: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  activeFilterText: {
    fontSize: 14,
    color: 'blue',
    marginRight: 8,
  },
})

export default ActiveFilterList;