import React from 'react';
import { StyleSheet, View, Image, useColorScheme } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Rating } from 'react-native-ratings';
import { Colors } from '@/constants/Colors';

interface BeerCardProps {
  name: string;
  id: string;
  brewery: string;
  countryIso: string;
  image: string;
  userRating: number;
  globalRating: number;
}

const BeerCard: React.FC<BeerCardProps> = ({ name, brewery, countryIso, image, userRating, globalRating }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const isUserRatingAvailable = userRating !== undefined && userRating !== null;
  const ratingValue = isUserRatingAvailable ? userRating : globalRating ?? 0;
  const ratingColor = isUserRatingAvailable ? theme.tint : theme.icon;

  const displayedGlobalRating = globalRating ? globalRating.toFixed(1) : 'N/A';
  const displayedUserRating = isUserRatingAvailable ? userRating.toFixed(1) : 'N/A';

  const styles = getStyles(theme);

  return (
    <Card style={styles.card}>
      {/* Title and Flag Section */}
      <View style={styles.titleContainer}>
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
        <View style={styles.titleTextContainer}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>{brewery}</Text>
        </View>
      </View>

      {/* Beer Image Section */}
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

      {/* Rating Section */}
      <Card.Content style={styles.cardContent}>
        <View style={styles.ratingContainer}>
          {/* Star Rating */}
          <Rating
            readonly
            type="custom"
            ratingColor={ratingColor}
            ratingBackgroundColor={theme.background}
            imageSize={30}
            ratingCount={5}
            fractions={2}
            startingValue={ratingValue}
            tintColor={theme.foreground}
          />

          {/* Rating Boxes */}
          <View style={styles.ratingBoxesContainer}>
            {displayedGlobalRating !== 'N/A' && displayedGlobalRating !== displayedUserRating && (
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
};

const getStyles = (theme: typeof Colors.light | typeof Colors.dark) =>
  StyleSheet.create({
    card: {
      margin: 16,
      flex: 1,
      backgroundColor: theme.foreground,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 20,
      marginTop: 16,
    },
    flagContainer: {
      marginRight: 12,
    },
    flagImage: {
      width: 36,
      height: 36,
    },
    titleTextContainer: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'left',
    },
    subtitle: {
      fontSize: 16,
      color: theme.text,
      textAlign: 'left',
    },
    coverContainer: {
      width: '100%',
      alignItems: 'center',
      height: 330,
      marginTop: 10,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    ratingContainer: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    ratingBoxesContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 8,
      marginBottom: 10,
    },
    globalRatingBox: {
      backgroundColor: theme.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 8,
      borderRadius: 4,
    },
    globalRatingText: {
      fontSize: 16,
      color: theme.text,
      fontWeight: 'bold',
    },
    userRatingBox: {
      backgroundColor: theme.tint,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    userRatingText: {
      fontSize: 16,
      color: theme.text,
      fontWeight: 'bold',
    },
    cardContent: {
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
  });


export default BeerCard;