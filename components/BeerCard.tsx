import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Card, Title, Text } from 'react-native-paper';
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import { flagImages, beerImages} from '../data/mappers/imageMapper'


interface BeerCardProps {
  name: string;
  id: string;
  brewery: string;
  country: string;
  overallRating: number;
}


const BeerCard: React.FC<BeerCardProps> = ({ name, brewery, country, overallRating }) => {
  return (
    <Card style={styles.card}>
      <Card.Title
        title={name}
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
          source={beerImages[name]}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <Card.Content>
      </Card.Content>
      <View style={styles.ratingContainer}>
        <StarRatingDisplay
          rating={overallRating}
        />
         <Text style={styles.ratingText}>({overallRating}/5)</Text>
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
