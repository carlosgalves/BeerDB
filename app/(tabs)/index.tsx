import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { supabase } from '../../utils/supabase.config.js';
import { Picker } from '@react-native-picker/picker';
import FilterModal from '../../components/FilterModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [beers, setBeers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRatings, setUserRatings] = useState<{ [key: string]: number }>({});
  const [sortOption, setSortOption] = useState<'Name A-Z' | 'Name Z-A' | 'Country A-Z' | 'Country Z-A' | 'Rating Ascending' | 'Rating Descending'>('Rating Descending');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [countries, setCountries] = useState([]);
  const [breweries, setBreweries] = useState([]);
  const [beerTypes, setBeerTypes] = useState([]);
  const [filters, setFilters] = useState([]);
  const [activeFilterType, setActiveFilterType] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch user info
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(data?.user);
      }
      setInitializing(false);  // Stop initializing once we fetch user data
    };

    // If initializing, call fetchUser
    if (initializing) {
      fetchUser();
    }

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (initializing) setInitializing(false);
      if (!session?.user) {
        router.replace('/auth');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [initializing]);

  useEffect(() => {
    fetchData('Country');
    fetchData('Brewery');
    fetchData('BeerType');
    fetchBeers();
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
      /* if (user) {
        await fetchUserRatings(data);
      } */
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
  }, [countries, breweries]);

  const handleRemoveFilter = useCallback((filterToRemove) => {
    setFilters((prevFilters) => prevFilters.filter(filter =>
      !(filter.type === filterToRemove.type && filter.value === filterToRemove.value)
    ));
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearAllFilters = () => {
    setFilters([]);
  };

  const refreshData = async () => {
    setLoading(true);
    await fetchBeers();
  };

  const filteredBeers = useMemo(() => {
    let filtered = [...beers];

    // Search
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

      <View style={styles.filtersRow}>
        <Picker
          selectedValue={sortOption}
          onValueChange={(value) => setSortOption(value)}
          style={styles.picker}
        >
          <Picker.Item label="Rating ↓" value="Rating Descending" />
          <Picker.Item label="Rating ↑" value="Rating Ascending" />
          <Picker.Item label="Name A-Z" value="Name A-Z" />
          <Picker.Item label="Name Z-A" value="Name Z-A" />
          <Picker.Item label="Country A-Z" value="Country A-Z" />
          <Picker.Item label="Country Z-A" value="Country Z-A" />
        </Picker>

        <Pressable
          style={styles.filterButton}
          onPress={() => openFilterModal()}
        >
          <Text style={styles.filterButtonText}>Add Filter</Text>
        </Pressable>
      </View>

      {filters.length > 0 && (
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
      )}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredBeers.length} {filteredBeers.length === 1 ? 'beer' : 'beers'} found
        </Text>
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
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
  },
  labelText: {
    fontSize: 14,
    marginRight: 8,
    flexShrink: 0,
  },
  picker: {
    width: '30%',
    flex: 1,
    marginRight: 20,
    color: '#333',
  },
  filtersContainer: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButtonsContainer: {
    paddingVertical: 8,
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
  },
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
  resultsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
  },
});