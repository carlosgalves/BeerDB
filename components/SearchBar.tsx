import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SearchBar = ({ searchQuery, setSearchQuery }) => {

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <View style={styles.searchBarContainer}>
      <View style={styles.searchBarWrapper}>
        <Icon name="magnify" size={20} color="#ccc" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        {searchQuery ? (
          <Pressable onPress={clearSearch}>
            <Icon name="close-circle" size={24} style={styles.clearButton} />
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  searchBarContainer: {
    alignItems: 'center',
    padding: 16,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 10,
    color: '#ccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default SearchBar;