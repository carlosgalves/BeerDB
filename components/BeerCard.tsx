import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Card, Title, Text } from 'react-native-paper';
import { StarRatingDisplay } from 'react-native-star-rating-widget';


const flagImages: { [key: string]: any } = {
  "Angola": require(`../assets/images/flags/ao.png`),
  "Portugal": require(`../assets/images/flags/pt.png`),
};

const beerImages: { [key: string]: any } = {
  "Cuca": require('../assets/images/beer/cuca.png'),
  "Coruja": require('../assets/images/beer/coruja.png'),
};

interface BeerCardProps {
  beerName: string;
  beerID: string;
  brewery: string;
  country: string;
  rating: number;
}


const BeerCard: React.FC<BeerCardProps> = ({ beerName, brewery, country, rating }) => {
  return (
    <Card style={styles.card}>
      <Card.Title
        title={beerName}
        subtitle={brewery}
        titleStyle={styles.titleStyle}
        subtitleStyle={styles.subtitleStyle}
      />
      <View style={styles.flagContainer}>
        <Image
          source={flagImages[country]}
          style={styles.flagImage}
        />
      </View>
      <View style={styles.coverContainer}>
        <Image
          source={beerImages[beerName]}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <Card.Content>
      </Card.Content>
      <View style={styles.ratingContainer}>
        <StarRatingDisplay
          rating={rating}
        />
         <Text style={styles.ratingText}>({rating}/5)</Text>
      </View>
    </Card>
  );
};


const styles = StyleSheet.create({
  card: {
    margin: 16,
    flex: 1,
    height: '100%',
  },
  titleStyle: {
    textAlign: 'center',
  },
  subtitleStyle: {
    textAlign: 'center',
  },
  flagContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  flagImage: {
    width: 30,
    height: 30,
  },
  coverContainer: {
    width: '100%',
    alignItems: 'center',
    height: 330,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  ratingText: {
    marginTop: 4,
    fontSize: 16,
    color: '#555',
  },
});

export default BeerCard;
