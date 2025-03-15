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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SearchBar from '../../components/SearchBar';
import FilterSelector from '../../components/FilterSelector';
import ActiveFilterList from '../../components/ActiveFilterList';
import SortSelector from '../../components/SortSelector';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [beers, setBeers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRatings, setUserRatings] = useState<{ [key: string]: number }>({});
  const [globalRatings, setGlobalRatings] = useState([]);
  const [sortOption, setSortOption] = useState<'Name A-Z' | 'Name Z-A' | 'Country A-Z' | 'Country Z-A' | 'Rating Ascending' | 'Rating Descending' | 'Global Rating Ascending' | 'Global Rating Descending'>('Global Rating Descending');
  const [countries, setCountries] = useState([]);
  const [breweries, setBreweries] = useState([]);
  const [beerTypes, setBeerTypes] = useState([]);
  const [filters, setFilters] = useState([]);
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
      setInitializing(false);
    };

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

      if (error) throw error;

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
      let { data, error } = await supabase.from('Beer').select('*');

      // Add brewery names
      data = await Promise.all(data.map(async (beer) => {
        const brewery = breweries.find(brew => brew.id === beer.breweryId);
        return {
          ...beer,
          brewery: brewery ? brewery.name : 'Unknown Brewery',
        };
      }));

      if (error) throw error;

      fetchGlobalRatings(data);

      if (user) {
        await fetchUserRatings(data);
      }

      setBeers(data);

    } catch (error) {
      console.error('Error fetching beers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalRatings = async (beerData) => {
    try {
      const ratings = {};

      await Promise.all(
        beerData.map(async (beer) => {
          try {
            const { data: globalRating, error: globalRatingError } = await supabase
              .from('Beer')
              .select('overallRating')
              .eq('id', beer.id)
              .single();

            if (globalRatingError) {
              throw new Error(globalRatingError.message);
            }

            ratings[beer.id] = beer.overallRating;
          } catch (err) {
            console.error(`Error fetching rating for beer ${beer.id}:`, err);
            ratings[beer.id] = 0;
          }
        })
      );
      setGlobalRatings(ratings);
    } catch (error) {
      console.error('Error fetching global ratings:', error);
    }
  };

  const fetchUserRatings = async (beerData) => {
    try {
      const ratings = {};

      if (user) {
        await Promise.all(
          beerData.map(async (beer) => {
            try {
              const { data: userRating, error: userRatingError } = await supabase
                .from('UserRating')
                .select('overallRating')
                .eq('beerId', beer.id)
                .eq('userId', user.id)
                .maybeSingle();

              if (userRatingError) {
                throw new Error(userRatingError.message);
              }

              // Check if user rating exists
              if (userRating && userRating.overallRating !== null) {
                ratings[beer.id] = userRating.overallRating;
              } else {
                ratings[beer.id] = null;
              }
            } catch (err) {
              console.error(`Error fetching rating for beer ${beer.id}:`, err);
              ratings[beer.id] = 0;
            }
          })
        );
      }
      setUserRatings(ratings);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
    }
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
      case 'Global Rating Ascending':
        filtered.sort((a, b) =>
          ((globalRatings[a.id] || a.overallRating || 0) - (globalRatings[b.id] || b.overallRating || 0))
        );
        break;
      case 'Global Rating Descending':
        filtered.sort((a, b) =>
          ((globalRatings[b.id] || b.overallRating || 0) - (globalRatings[a.id] || a.overallRating || 0))
        );
        break;
    }

    return filtered;
  }, [beers, searchQuery, filters, sortOption, userRatings]);


  if (loading || initializing) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }



  return (
    <View style={styles.container}>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <View style={styles.filtersRow}>

        <SortSelector

        />

        <FilterSelector
          filters={filters}
          setFilters={setFilters}
          countries={countries}
          breweries={breweries}
          beerTypes={beerTypes}
        />

      </View>

      <ActiveFilterList
        filters={filters}
        setFilters={setFilters}
      />

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredBeers.length} {filteredBeers.length === 1 ? 'beer' : 'beers'} found
        </Text>
      </View>



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
                globalRating={globalRatings[beer.id]}
                userRating={userRatings[beer.id]}
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
  resultsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
  },
});