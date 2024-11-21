import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import BeerCard from '../../components/BeerCard';
import { FIRESTORE } from '../../firebaseConfig'
import { collection, getDocs } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';


export default function HomeScreen() {

  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <BeerCard
            key={beer.id}
            name={beer.name}
            brewery={beer.brewery}
            country={beer.country}
          />
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
