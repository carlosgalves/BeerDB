import { StyleSheet, View, ScrollView} from 'react-native';
import BeerCard from '../../components/BeerCard';


export const beers = [
  {
    beerName: "Cuca",
    brewery: "",
    country: "Angola",
    beerID: "cuca",
    rating: 4.21,
  },
  {
    beerName: "Coruja",
    brewery: "Super Bock Group",
    country: "Portugal",
    beerID: "coruja",
    rating: 3.9,
  },
];


export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {beers.map((beer, index) => (
          <BeerCard
            beerName={beer.beerName}
            brewery={beer.brewery}
            country={beer.country}
            beerID={beer.beerID}
            rating={beer.rating}
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
