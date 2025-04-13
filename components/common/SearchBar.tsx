import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  useColorScheme
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '@/constants/Colors';

const SearchBar = ({ searchQuery, setSearchQuery }) => {

  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = getStyles(theme);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <View style={styles.searchBarContainer}>
      <View style={styles.searchBarWrapper}>
        <Icon name="magnify" size={25} color={theme.text} style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Pesquisar"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        {searchQuery ? (
          <Pressable onPress={clearSearch}>
            <Icon name="close-circle" size={25} style={styles.clearButton} />
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}


const getStyles = (theme: typeof Colors.light | typeof Colors.dark) => StyleSheet.create({
  searchBarContainer: {
    marginTop: 20,
    backgroundColor: theme.background,
    alignItems: 'center',
    backgroundColor: theme.tint,
    padding: 16,
  },
  searchBarWrapper: {
    backgroundColor: theme.background,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: theme.text,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    color: theme.placeholder,
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 10,
    color: theme.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default SearchBar;