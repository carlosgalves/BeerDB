import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Pressable,
  TextInput,
  Text,
  Button
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import BeerCard from '../../components/BeerCard';
import { FIRESTORE, FIREBASE_AUTH } from '../../firebaseConfig';
import { supabase } from '../../utils/supabase.config.js';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, FirebaseAuthTypes } from 'firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import FilterModal from '../../components/FilterModal';

export default function HomeScreen() {

  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const [beers, setBeers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRatings, setUserRatings] = useState<{ [key: string]: number }>({});
  const [sortOption, setSortOption] = useState<'Name A-Z' | 'Name Z-A' | 'Country A-Z' | 'Country Z-A' | 'Rating Ascending' | 'Rating Descending'>('Rating Descending');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [countries, setCountries] = useState([]);
  const [breweries, setBreweries] = useState([]);
  const [beerTypes, setBeerTypes] = useState([]);
  const [filters, setFilters] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
      if (!user) {
        router.replace('/auth');
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initializing]);

  useEffect(() => {
    fetchData('Country');
    fetchData('Brewery');
    fetchData('BeerType');
    fetchBeers(); // Fetch beers once when component mounts
  }, []);

  const fetchData = async (collectionName) => {
    try {
      let query = supabase.from(collectionName);

      if (collectionName === 'Country') {
        query = query.select('name, iso');
      } else if (collectionName === 'Brewery') {
        query = query.select('id, name');
      } else if (collectionName === 'BeerType') {
        query = query.select('name');
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (collectionName === 'Country') {
        setCountries(data);
      } else if (collectionName === 'Brewery') {
        setBreweries(data);
      } else if (collectionName === 'BeerType') {
        setBeerTypes(data);
      }
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
    }
  };

  const fetchBeers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('Beer').select('*');

      if (error) {
        throw error;
      }

      setBeers(data);

      // Fetch user ratings if user is logged in
      if (user) {
        await fetchUserRatings(data);
      }
    } catch (error) {
      console.error('Error fetching beers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRatings = async (beerData) => {
    try {
      const ratings = {};
      await Promise.all(
        beerData.map(async (beer) => {
          try {
            const ratingRef = doc(FIRESTORE, 'beers', beer.id, 'ratings', user.uid);
            const ratingDoc = await getDoc(ratingRef);
            if (ratingDoc.exists()) {
              ratings[beer.id] = ratingDoc.data()?.overallRating || 0;
            }
          } catch (err) {
            console.error(`Error fetching rating for beer ${beer.id}:`, err);
          }
        })
      );
      setUserRatings(ratings);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
    }
  };

const handleApplyFilters = (filterType, selectedValue) => {
    if (!selectedValue) {
      // Remove the filter if no value is selected
      setFilters(filters.filter(filter => filter.type !== filterType));
      return;
    }

    let value = selectedValue;

    // Convert name to proper filter object with ID/ISO references
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

    // Update filters
    const updatedFilters = [...filters.filter(filter => filter.type !== filterType)];
    updatedFilters.push({
      type: filterType,
      value: value,
      displayValue: selectedValue // Keep the display name
    });

    setFilters(updatedFilters);
    setFilterModalVisible(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const refreshData = async () => {
    setLoading(true);
    await fetchBeers();
  };

  const filteredBeers = useMemo(() => {
    let filtered = [...beers];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(beer =>
        beer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    filters.forEach(({ type, value }) => {
      if (type === 'country') {
        filtered = filtered.filter(beer => beer.countryIso === value);
      } else if (type === 'brewery') {
        filtered = filtered.filter(beer => beer.breweryId === value);
      } else if (type === 'beerType') {
        filtered = filtered.filter(beer => beer.type === value);
      }
    });

    // Sort list
    switch (sortOption) {
      case 'Name A-Z':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Name Z-A':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'Country A-Z':
        filtered.sort((a, b) => (a.countryIso || '').localeCompare(b.countryIso || ''));
        break;
      case 'Country Z-A':
        filtered.sort((a, b) => (b.countryIso || '').localeCompare(a.countryIso || ''));
        break;
      case 'Rating Ascending':
        filtered.sort((a, b) =>
          ((userRatings[a.id] || a.overallRating || 0) - (userRatings[b.id] || b.overallRating || 0))
        );
        break;
      case 'Rating Descending':
        filtered.sort((a, b) =>
          ((userRatings[b.id] || b.overallRating || 0) - (userRatings[a.id] || a.overallRating || 0))
        );
        break;
    }

    return filtered;
  }, [beers, searchQuery, filters, sortOption, userRatings]);


  if (loading || initializing) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  // display names for dropdown components
  const countryNames = countries.map(country => country.name);
  const breweryNames = breweries.map(brewery => brewery.name);
  const beerTypeNames = beerTypes.map(type => type.name);

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
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

      <View style={styles.sortContainer}>
        <Picker
          selectedValue={sortOption}
          onValueChange={(value) => setSortOption(value)}
          style={styles.picker}
        >
          <Picker.Item label="Name A-Z" value="Name A-Z" />
          <Picker.Item label="Name Z-A" value="Name Z-A" />
          <Picker.Item label="Country A-Z" value="Country A-Z" />
          <Picker.Item label="Country Z-A" value="Country Z-A" />
          <Picker.Item label="Rating Ascending" value="Rating Ascending" />
          <Picker.Item label="Rating Descending" value="Rating Descending" />
        </Picker>
      </View>

       <Button title="Add Filter" onPress={() => setFilterModalVisible(true)} />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        countries={countryNames}
        breweries={breweryNames}
        beerTypes={beerTypeNames}
      />

      <FlatList
        data={filteredBeers}
        keyExtractor={(item) => item.id}
        renderItem={({ item: beer }) => (
          <Link
            push
            href={{
              pathname: '/beer-details/[id]',
              params: { id: beer.id },
            }}
            asChild
          >
            <Pressable>
              <BeerCard
                {...beer}
                overallRating={userRatings[beer.id] || beer.overallRating || 0}
              />
            </Pressable>
          </Link>
        )}
        contentContainerStyle={styles.scrollContainer}
        onRefresh={refreshData}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
  },
  searchBar: {
    height: 40,
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  clearButton: {
    marginLeft: 10,
    color: '#ccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sortButton: {
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  activeSort: {
    backgroundColor: '#007bff',
  },
  sortContainer: {
    marginHorizontal: 16,
    width: '40%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    paddingHorizontal: 10,
  },
  filterContainer: {
    marginHorizontal: 16,
    width: '40%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },

});
