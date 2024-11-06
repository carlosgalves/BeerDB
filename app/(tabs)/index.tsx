import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import BeerCard from '../../components/BeerCard';
import { Link } from 'expo-router';
//import { getBeers } from '../../data/beerData';
import { FIRESTORE } from '../../firebaseConfig'
import { collection, getDocs } from 'firebase/firestore';


export default function HomeScreen() {

  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchBeers() {
      try {
        const querySnapshot = await getDocs(collection(FIRESTORE, 'beers')); // 'beers' is the collection name
        const beerData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBeers(beerData);
      } catch (error) {
        console.error("Error fetching beers:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBeers();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {beers.map((beer, index) => (
          <Link href={{
            pathname: '/beer-details/[id]',
            params: {
              id: beer.id,
            },
            }}
            asChild
            key={beer.id}
          >
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
