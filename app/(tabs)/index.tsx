import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Pressable,
  TextInput,
  Text
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import BeerCard from '../../components/BeerCard';
import { FIRESTORE, FIREBASE_AUTH } from '../../firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, FirebaseAuthTypes } from 'firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen() {

  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const [beers, setBeers] = useState([]);
  const [beerList, setBeerList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRatings, setUserRatings] = useState<{ [key: string]: number }>({});
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
    if (searchQuery.trim() === '') {
      setBeerList(memoizedBeers)
    } else {
      const filteredBeers = memoizedBeers.filter((beer) =>
        beer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setBeerList(filteredBeers);
    }
  }, [searchQuery, memoizedBeers]);

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
  }
});
