import { StyleSheet, View, ScrollView, Pressable} from 'react-native';
import BeerCard from '../../components/BeerCard';
import { Link } from 'expo-router';
import { beers } from '../../data/beerData';


export default function HomeScreen() {
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
          >
            <Pressable>
              <BeerCard
                beerName={beer.beerName}
                brewery={beer.brewery}
                country={beer.country}
                beerID={beer.beerID}
                rating={beer.rating}
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
