import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Card, Title, Text } from 'react-native-paper';
import { flagImages } from '../data/mappers/imageMapper'


interface BeerCardProps {
  name: string;
  id: string;
  brewery: string;
  country: string;
  countryIso: string;
  image: string;
}


const BeerCard: React.FC<BeerCardPsrops> = ({ name, brewery, country, countryIso, image }) => {
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
          source={flagImages[countryIso] || flagImages[""]}
          style={styles.flagImage}
        />
      </View>
      <View style={styles.coverContainer}>
        <Image
          source={
            image
              ? { uri: `data:image/png;base64,${image}` }
              : require('../assets/images/beer/unknown.png')
          }
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <Card.Content>
      </Card.Content>
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
  }
});

export default BeerCard;