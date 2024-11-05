import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { beers } from '../../../data/beerData';


export default function BeerDetails() {
  const { id } = useLocalSearchParams();

  const beer = beers.find((beer) => beer.id === id);

  if (!beer) {
      return (
        <View style={styles.container}>
          <Text style={styles.error}>Beer not found.</Text>
        </View>
      );
    }

    const {
      beerName,
      brewery,
      country,
      type,
      description,
      alcoholPercentage,
      aromaRating,
      tasteRating,
      afterTasteRating,
      rating,
      tags,
    } = beer;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{beerName}</Text>
      <Text style={styles.subtitle}>Brewery: {brewery || 'Unknown'}</Text>
      <Text style={styles.country}>Country: {country}</Text>
      <Text style={styles.type}>Type: {type}</Text>
      <Text style={styles.description}>Description: {description}</Text>
      <Text style={styles.alcohol}>ABV: {alcoholPercentage}%</Text>
      <Text style={styles.rating}>Overall Rating: {rating}</Text>
      <Text style={styles.tags}>Tags: {tags?.join(', ')}</Text>
      <Text style={styles.detail}>Aroma Rating: {aromaRating}</Text>
      <Text style={styles.detail}>Taste Rating: {tasteRating}</Text>
      <Text style={styles.detail}>Aftertaste Rating: {afterTasteRating}</Text>
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