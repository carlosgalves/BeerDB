import React, { PureComponent } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Card, Title, Text } from 'react-native-paper';
import { flagImages } from '../data/mappers/imageMapper'
import { Rating } from 'react-native-ratings';


interface BeerCardProps {
  name: string;
  id: string;
  brewery: string;
  country: string;
  countryIso: string;
  image: string;
  userRating: number;
  globalRating: number;
}


class BeerCard extends PureComponent<BeerCardProps> {
  render() {
    const { name, brewery, countryIso, image, userRating, globalRating } = this.props;

    // Determine which rating to show
    const isUserRatingAvailable = userRating !== undefined && userRating !== null;
    const ratingValue = isUserRatingAvailable ? userRating : globalRating ?? 0;
    const ratingColor = isUserRatingAvailable ? '#f4ce0c' : '#ccba61';

    const displayedGlobalRating = globalRating ? globalRating.toFixed(1) : 'N/A';
    const displayedUserRating = isUserRatingAvailable ? userRating.toFixed(1) : 'N/A';

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
            source={
              countryIso
                ? { uri: `https://dkawnlfcrjkdsivajojq.supabase.co/storage/v1/object/public/flags/${countryIso}.png` }
                : require('../assets/images/placeholders/unknown-flag.png')
            }
            style={styles.flagImage}
          />
        </View>
        <View style={styles.coverContainer}>
          <Image
            source={
              image
                ? { uri: `https://dkawnlfcrjkdsivajojq.supabase.co/storage/v1/object/public/beer-images/${image}` }
                : require('../assets/images/placeholders/unknown-beer.png')
            }
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <Card.Content>
          <View style={styles.ratingContainer}>
            <Rating
              readonly
              type="custom"
              ratingColor={ratingColor}
              ratingBackgroundColor="#c8c7c8"
              imageSize={30}
              ratingCount={5}
              fractions={2}
              startingValue={ratingValue}
              tintColor={styles.card.backgroundColor}
            />

            <View style={styles.ratingBoxesContainer}>
              {displayedGlobalRating !== null && displayedUserRating != null && displayedUserRating !== undefined &&
                displayedGlobalRating !== displayedUserRating && (
                <View style={styles.globalRatingBox}>
                  <Text style={styles.globalRatingText}>
                    {displayedGlobalRating}
                  </Text>
                </View>
              )}

              {isUserRatingAvailable && (
                <View style={styles.userRatingBox}>
                  <Text style={styles.userRatingText}>{displayedUserRating}</Text>
                </View>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  }
};


const styles = StyleSheet.create({
  card: {
    margin: 16,
    flex: 1,
    height: '100%',
    backgroundColor: '#ededed'
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
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  globalRatingBox: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    borderRadius: 4,
  },
  globalRatingText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  userRatingBox: {
    backgroundColor: '#f4ce0c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  userRatingText: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
  },
});

export default BeerCard;