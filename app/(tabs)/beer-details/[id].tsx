import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import StarRating from 'react-native-star-rating-widget';
import { FIRESTORE } from '../../../firebaseConfig'
import { collection, doc, getDoc } from 'firebase/firestore';

export default function BeerDetails() {
  const { id } = useLocalSearchParams();
  const [beer, setBeer] = useState();
  const [loading, setLoading] = useState(true);
  const [aromaRating, setAromaRating] = useState(0);
  const [tasteRating, setTasteRating] = useState(0);
  const [afterTasteRating, setAfterTasteRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);

  useEffect(() => {
    async function fetchBeerData() {
      try {
        const beerRef = doc(FIRESTORE, 'beers', id)
        const beerDoc = await getDoc(beerRef)

        if (beerDoc.exists()) {
          const beer = { id: beerDoc.id, ...beerDoc.data() };
          console.log('Fetched beer:', beer);
          setBeer(beer)
        } else {
          console.log('No such beer!');
        }
      } catch (error) {
        console.error("Error fetching this beer:", error);
      }finally {
        setLoading(false);
      }
    }
    fetchBeerData()
  }, [id]);

  useEffect(() => {
    const averageRating = (aromaRating + tasteRating + afterTasteRating) / 3;
    setOverallRating(averageRating.toFixed(2));
  }, [aromaRating, tasteRating, afterTasteRating]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!beer) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Beer not found.</Text>
      </View>
    );
  }

  const {
    name,
    brewery,
    country,
    type,
    description,
    abv,
    tags
  } = beer;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.subtitle}>Brewery: {brewery || 'Unknown'}</Text>
      <Text style={styles.country}>Country: {country}</Text>
      <Text style={styles.type}>Type: {type}</Text>
      <Text style={styles.description}>Description: {description}</Text>
      <Text style={styles.alcohol}>ABV: {abv}%</Text>
      <Text style={styles.rating}>Overall Rating: {overallRating}</Text>
      <Text style={styles.tags}>Tags: {tags?.join(', ')}</Text>
      <Text style={styles.detail}>Aroma:</Text>
      <StarRating
        rating={aromaRating}
        onChange={setAromaRating}
        maxStars={5}
        starSize={40}
        enableSwiping={true}
        enableHalfStar={true}
      />

      <Text style={styles.detail}>Taste:</Text>
      <StarRating
        rating={tasteRating}
        onChange={setTasteRating}
        maxStars={5}
        starSize={40}
        enableSwiping={true}
        enableHalfStar={true}
      />

      <Text style={styles.detail}>Aftertaste:</Text>
      <StarRating
        rating={afterTasteRating}
        onChange={setAfterTasteRating}
        maxStars={5}
        starSize={40}
        enableSwiping={true}
        enableHalfStar={true}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  country: {
    fontSize: 16,
    marginBottom: 4,
  },
  type: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
  },
  alcohol: {
    fontSize: 16,
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tags: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  detail: {
    fontSize: 16,
    marginBottom: 4,
  },
  error: {
    fontSize: 20,
    color: 'red',
    textAlign: 'center',
  },
});