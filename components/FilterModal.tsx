import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function FilterModal({ visible, onClose, countries, breweries, beerTypes, onApplyFilters, filters }) {
  const [filterType, setFilterType] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);

  const activeFilterTypes = filters.map((filter) => filter.type);
  const isCountrySelected = activeFilterTypes.includes('country');
  const isBrewerySelected = activeFilterTypes.includes('brewery');

  const getOptions = () => {
    switch (filterType) {
      case 'country': return countries;
      case 'brewery': return breweries;
      case 'beerType': return beerTypes;
      default: return [];
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select a Filter</Text>
          <View style={styles.filterOptions}>
            <Pressable
              style={[styles.filterButton, isBrewerySelected && styles.disabledButton]}
              onPress={() => !isBrewerySelected && setFilterType('country')}
              disabled={isBrewerySelected}
            >
              <Text style={[styles.filterText, isBrewerySelected && styles.disabledText]}>Country</Text>
            </Pressable>
            <Pressable
              style={[styles.filterButton, isCountrySelected && styles.disabledButton]}
              onPress={() => !isCountrySelected && setFilterType('brewery')}
              disabled={isCountrySelected}
            >
              <Text style={[styles.filterText, isCountrySelected && styles.disabledText]}>Brewery</Text>
            </Pressable>
            <Pressable
              style={styles.filterButton}
              onPress={() => setFilterType('beerType')}
            >
              <Text style={styles.filterText}>Beer Type</Text>
            </Pressable>
          </View>

          {filterType && (
            <Picker
              selectedValue={selectedValue}
              onValueChange={(value) => setSelectedValue(value)}
              style={styles.picker}
            >
              <Picker.Item label={`Select ${filterType}`} value={null} />
              {getOptions().map((item, index) => (
                <Picker.Item key={index} label={item} value={item} />
              ))}
            </Picker>
          )}

          <View style={styles.modalActions}>
            <Pressable style={styles.applyButton} onPress={() => onApplyFilters(filterType, selectedValue)}>
              <Text style={styles.buttonText}>Apply</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  filterText: {
    fontSize: 16,
  },
  disabledText: {
    color: '#666',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  applyButton: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  cancelButton: {
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
