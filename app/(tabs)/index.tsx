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
  const [beerList, setBeerList] = useState([]);
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
    fetchData('country', setCountries);
    fetchData('brewery', setBreweries);
    fetchData('beer_type', setBeerTypes);
  }, []);

  const fetchData = async (collectionName, setState) => {
    try {
      const { data, error } = await supabase.from(collectionName).select('name');

      if (error) {
        throw error;
      }
      const dataList = data.map((item) => item.name);
      setState(dataList);
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
    }
  };

  const handleApplyFilters = (filterType, selectedValue) => {
    const updatedFilters = [...filters];
    const filterIndex = updatedFilters.findIndex((filter) => filter.type === filterType);

    if (filterIndex > -1) {
      updatedFilters[filterIndex] = { type: filterType, value: selectedValue };
    } else {
      updatedFilters.push({ type: filterType, value: selectedValue });
    }

    setFilters(updatedFilters);
    setFilterModalVisible(false);
  };

  const fetchBeers = React.useCallback(async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(FIRESTORE, 'beers'));
      const beerData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setBeers(beerData)

      if (user) {
        const ratings: { [key: string]: number } = {};
        await Promise.all(
          beerData.map(async (beer) => {
            const ratingRef = doc(FIRESTORE, 'beers', beer.id, 'ratings', user.uid);
            const ratingDoc = await getDoc(ratingRef);
            if (ratingDoc.exists()) {
              ratings[beer.id] = ratingDoc.data()?.overallRating || 0;
            }
          })
        );
        setUserRatings(ratings);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const memoizedBeers = useMemo(() => beers, [beers])

  useEffect(() => {
    fetchBeers();
  }, [fetchBeers]);

  useEffect(() => {
    let filteredBeers = memoizedBeers;

    if (searchQuery.trim() !== '') {
      filteredBeers = filteredBeers.filter((beer) =>
        beer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filters.forEach(({ type, value }) => {
      if (value) {
        filteredBeers = filteredBeers.filter((beer) => beer[type]?.toLowerCase() === value.toLowerCase());
      }
    });

    switch (sortOption) {
      case 'Name A-Z':
        filteredBeers = [...filteredBeers].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Name Z-A':
        filteredBeers = [...filteredBeers].sort((a, b) => b.name.localeCompare(a.name));
        break;
      /*
      case 'Country A-Z':
        filteredBeers = [...filteredBeers].sort((a, b) => (a.country || '').localeCompare(b.country || ''));
        break;
      case 'Country Z-A':
        filteredBeers = [...filteredBeers].sort((a, b) => (b.country || '').localeCompare(a.country || ''));
        break;
      */
      case 'Rating Ascending':
        filteredBeers = [...filteredBeers].sort((a, b) => (userRatings[a.id] || 0) - (userRatings[b.id] || 0));
        break;
      case 'Rating Descending':
        filteredBeers = [...filteredBeers].sort((a, b) => (userRatings[b.id] || 0) - (userRatings[a.id] || 0));
        break;
    }

    setBeerList(filteredBeers);
  }, [searchQuery, memoizedBeers, sortOption, filters, userRatings]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (loading || initializing) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

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
         countries={countries}
         breweries={breweries}
         beerTypes={beerTypes}
       />


      <FlatList
        data={beerList}
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
              <BeerCard {...beer} overallRating={userRatings[beer.id] || 0} />
            </Pressable>
          </Link>
        )}
        contentContainerStyle={styles.scrollContainer}
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
