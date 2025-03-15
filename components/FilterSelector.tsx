import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import FilterModal from '../components/FilterModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FilterSelector = ({
  filters,
  setFilters,
  countries,
  breweries,
  beerTypes
}) => {
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilterType, setActiveFilterType] = useState(null);

  const openFilterModal = (filterType) => {
    setActiveFilterType(filterType);
    setFilterModalVisible(true);
  };

  const handleApplyFilters = useCallback((filterType, selectedValue) => {
    setFilters((prevFilters) => {
      if (!selectedValue) {
        // Remove filter if no value is selected
        return prevFilters.filter(filter => filter.type !== filterType);
      }

      let value = selectedValue;

      if (filterType === 'country') {
        const countryObject = countries.find(c => c.name === selectedValue);
        if (countryObject) {
          value = countryObject.iso;
        }
      } else if (filterType === 'brewery') {
        const breweryObject = breweries.find(b => b.name === selectedValue);
        if (breweryObject) {
          value = breweryObject.id;
        }
      }

      return [
        ...prevFilters.filter(filter => filter.type !== filterType),
        { type: filterType, value, displayValue: selectedValue },
      ];
    });

    setFilterModalVisible(false);
  }, [countries, breweries, setFilters, setFilterModalVisible]);


  // display names for dropdown components
  const countryNames = countries.map(country => country.name);
  const breweryNames = breweries.map(brewery => brewery.name);
  const beerTypeNames = beerTypes.map(type => type.name);

  return (
    <>
      <View style={styles.filtersRow}>
        <Pressable
          style={styles.filterButton}
          onPress={() => openFilterModal()}
        >
          <Text style={styles.filterButtonText}>Add Filter</Text>
        </Pressable>
      </View>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        countries={countryNames}
        breweries={breweryNames}
        beerTypes={beerTypeNames}
        filters={filters}
        activeFilterType={activeFilterType}
      />
    </>
  );
}



const styles = StyleSheet.create({
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'blue',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight:20
  },
  filterButtonText: {
    color: 'blue',
    fontWeight: '500',
  }
})

export default FilterSelector;