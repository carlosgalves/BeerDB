import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import StarRating from 'react-native-star-rating-widget';
import { FIRESTORE } from '../../../firebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore';


export default function BeerDetails() {
  const { id } = useLocalSearchParams();
  const [beer, setBeer] = useState();
  const [loading, setLoading] = useState(true);
  const [aromaRating, setAromaRating] = useState(null);
  const [tasteRating, setTasteRating] = useState(null);
  const [afterTasteRating, setAfterTasteRating] = useState(null);
  const [overallRating, setOverallRating] = useState(null);

  useEffect(() => {
    async function fetchBeerData() {
      try {
        const beerRef = doc(FIRESTORE, 'beers', id)
        const beerDoc = await getDoc(beerRef)

        if (beerDoc.exists()) {
          const beer = { id: beerDoc.id, ...beerDoc.data() };
          console.log('Fetched beer:', beer);
          setBeer(beer)

          // Initialize ratings from the fetched beer data
          setOverallRating(beer.overallRating || 0);
          setAromaRating(beer.aromaRating ?? 0);
          setTasteRating(beer.tasteRating ?? 0);
          setAfterTasteRating(beer.afterTasteRating ?? 0);
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
    if ([aromaRating, tasteRating, afterTasteRating].every(rating => rating !== null && rating > 0)) {
      const averageRating = ((aromaRating + tasteRating + afterTasteRating) / 3).toFixed(2);
      setOverallRating(averageRating);
      updateRating('overallRating', averageRating)
    }
  }, [aromaRating, tasteRating, afterTasteRating]);

  async function updateRating(field, value) {
    try {
      const beerRef = doc(FIRESTORE, 'beers', id);
      await updateDoc(beerRef, { [field]: value });
      console.log(`Updated ${field} to ${value}`);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  }

  const handleAromaRatingChange = (rating) => {
    setAromaRating(rating);
    updateRating('aromaRating', rating);
  };

  const handleTasteRatingChange = (rating) => {
    setTasteRating(rating);
    updateRating('tasteRating', rating);
  };

  const handleAfterTasteRatingChange = (rating) => {
    setAfterTasteRating(rating);
    updateRating('afterTasteRating', rating);
  };

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
        onChange={handleAromaRatingChange}
        maxStars={5}
        starSize={40}
        enableSwiping={true}
        enableHalfStar={true}
      />

      <Text style={styles.detail}>Taste:</Text>
      <StarRating
        rating={tasteRating}
        onChange={handleTasteRatingChange}
        maxStars={5}
        starSize={40}
        enableSwiping={true}
        enableHalfStar={true}
      />

      <Text style={styles.detail}>Aftertaste:</Text>
      <StarRating
        rating={afterTasteRating}
        onChange={handleAfterTasteRatingChange}
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