import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import BeerCard from '../../components/BeerCard';
import { FIRESTORE, FIREBASE_AUTH } from '../../firebaseConfig'
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';


export default function HomeScreen() {

  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (!user) {
        router.push('/auth')
      }
    });

    return () => unsubscribe();
  }, []);

  async function fetchBeers() {
    try {
      const querySnapshot = await getDocs(collection(FIRESTORE, 'beers'));
      const beerData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBeers(beerData);
    } catch (error) {
      console.error("Error fetching beers:", error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchBeers();
    }, [])
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {beers.map((beer) => (
          <Link push href={{
            pathname: '/beer-details/[id]',
            params: {
              id: beer.id,
            },
            }}
            asChild
            key={beer.id}>
            <Pressable>
              <BeerCard
                {...beer}
              />
            </Pressable>
          </Link>
        ))}
      </ScrollView>
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
});
