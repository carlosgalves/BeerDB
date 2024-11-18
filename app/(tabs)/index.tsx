import { useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import BeerCard from '../../components/BeerCard';


export default function HomeScreen() {

  const [beers, setBeers] = useState([
      {
        id: '1',
        name: 'Cerveja',
        brewery: 'Cervejaria',
        country: '',
      },
      {
        id: '2',
        name: 'Cerveja',
        brewery: 'Cervejaria',
        country: '',
      }
    ]);

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
