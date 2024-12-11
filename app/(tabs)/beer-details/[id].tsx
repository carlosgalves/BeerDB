import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Button, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useNavigation } from 'expo-router';
import { FIRESTORE, FIREBASE_AUTH } from '../../../firebaseConfig';
import { doc, getDoc, updateDoc, collection, setDoc } from 'firebase/firestore';
import { flagImages, beerImages} from '../../../data/mappers/imageMapper'
import { Ionicons } from '@expo/vector-icons';
import { Rating } from 'react-native-ratings';
import { getAuth } from 'firebase/auth';


export default function BeerDetails() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [beer, setBeer] = useState();
  const [userRatings, setUserRatings] = useState({
    overallRating: null,
    tasteRating: null,
    aromaRating: null,
    afterTasteRating: null,
  });

  const navigation = useNavigation();
  const userId = getAuth().currentUser?.uid;

  useEffect(() => {
    async function fetchBeerData() {
      try {
        const beerRef = doc(FIRESTORE, 'beers', id);
        const beerDoc = await getDoc(beerRef);

        if (beerDoc.exists()) {
          const beer = { id: beerDoc.id, ...beerDoc.data() };
          setBeer(beer);

          const userRatingRef = doc(beerRef, 'ratings', userId);
          const userRatingDoc = await getDoc(userRatingRef);

          if (userRatingDoc.exists()) {
            const { tasteRating, aromaRating, afterTasteRating, overallRating } = userRatingDoc.data();
            setUserRatings({ tasteRating, aromaRating, afterTasteRating, overallRating });
          }
        } else {
          console.log('No such beer!');
        }
      } catch (error) {
        console.error("Error fetching beer:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBeerData();
  }, [id]);

  async function fetchUserRating(beerId) {
    const userId = auth.currentUser?.uid;
    if (!userId) return null;

    const ratingRef = doc(FIRESTORE, 'beers', beerId, 'ratings', userId);

    try {
      const ratingDoc = await getDoc(ratingRef);
      return ratingDoc.exists() ? ratingDoc.data() : null;
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  }

  const handleRatingSubmit = async (category, rating) => {
    const { aromaRating, tasteRating, afterTasteRating } = userRatings;

    if (!aromaRating || !tasteRating || !afterTasteRating) {
      console.error('All ratings (aroma, taste, afterTaste) must be provided before submission.');
      alert('Tens de classificar todos os parâmetros (aroma, sabor e fim de boca) individualmente de modo a submeter a classificação final.');
      return;
    }

    try {
      const beerRef = doc(FIRESTORE, 'beers', id);
      const userRatingRef = doc(beerRef, 'ratings', userId);

      const overallRating = (aromaRating + tasteRating + afterTasteRating) / 3;

      await setDoc(userRatingRef, { userId, aromaRating, tasteRating, afterTasteRating, overallRating }, { merge: true });

      console.log('Ratings successfully submitted:', userRatings);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
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
    name, brewery, country, type, description, abv, tags, image,
    overallRating, aromaRating, tasteRating, afterTasteRating
  } = beer;

  return (
    <>
    <Stack.Screen
      options={{
        title: name,
        headerLeft: () => (
          <Ionicons
            name="arrow-back"
            size={24}
            color="black"
            style={{ marginLeft: 10 }}
            onPress={() => navigation.goBack()}
          />
        ),
      }}
    />
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.subtitle}>Brewery: {brewery || 'Unknown'}</Text>
      <View style={styles.coverContainer}>
        <Image
          source={
            image
              ? { uri: `data:image/png;base64,${image}` }
              : require('../../../assets/images/beer/unknown.png')
          }
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <View style={styles.flagContainer}>
        <Image
          source={flagImages[country]}
          style={styles.flagImage}
        />
      </View>
      <Text style={styles.country}>Country: {country}</Text>
      <Text style={styles.type}>Type: {type}</Text>
      <Text style={styles.description}>Description: {description}</Text>
      <Text style={styles.alcohol}>ABV: {abv}%</Text>
      <Text style={styles.rating}>Overall Rating: {overallRating} | {userRatings.overallRating}</Text>
      <Text style={styles.tags}>Tags: {tags?.join(', ')}</Text>

      <Rating
        showRating
        readOnly
        type="star"
        imageSize={40}
        ratingCount={5}
        minValue={0}
        startingValue={userRatings.overallRating}
        jumpValue={0.5}
        fractions={2}
        onStartRating={null}
        onSwipeRating={null}
        onFinishRating={null}
        style={{ paddingVertical: 10 }}
      />

      <Text style={styles.detail}>Aroma: {userRatings.aromaRating}</Text>
      <Rating
        showRating
        type="star"
        imageSize={40}
        ratingCount={5}
        minValue={0}
        startingValue={userRatings.aromaRating}
        jumpValue={0.5}
        fractions={2}
        onStartRating={null}
        onSwipeRating={null}
        onFinishRating={(rating) =>
          setUserRatings((prev) => ({ ...prev, aromaRating: rating }))
        }
        style={{ paddingVertical: 10 }}
      />
      <Text style={styles.detail}>Taste: {userRatings.tasteRating}</Text>
      <Rating
        showRating
        type="star"
        imageSize={40}
        ratingCount={5}
        minValue={0}
        startingValue={userRatings.tasteRating}
        jumpValue={0.5}
        fractions={2}
        onStartRating={null}
        onSwipeRating={null}
        onFinishRating={(rating) =>
          setUserRatings((prev) => ({ ...prev, tasteRating: rating }))
        }
        style={{ paddingVertical: 10 }}
      />
      <Text style={styles.detail}>Aftertaste: {userRatings.afterTasteRating}</Text>
      <Rating
        showRating
        type="star"
        imageSize={40}
        ratingCount={5}
        minValue={0}
        startingValue={userRatings.afterTasteRating}
        jumpValue={0.5}
        fractions={2}
        onStartRating={null}
        onSwipeRating={null}
        onFinishRating={(rating) =>
          setUserRatings((prev) => ({ ...prev, afterTasteRating: rating }))
        }
        style={{ paddingVertical: 10 }}
      />
      <Button
        title="Submit Ratings"
        onPress={handleRatingSubmit}
        disabled={!userRatings.aromaRating || !userRatings.tasteRating || !userRatings.afterTasteRating}
      />
    </ScrollView>
    </>
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
    fontSize: 16,
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
  coverContainer: {
    width: '100%',
    alignItems: 'center',
    height: 330,
  },
  image: {
      width: '100%',
      height: '100%',
  },
  flagContainer: {
    position: 'absolute',
    top: 80,
    right: 50,
  },
  flagImage: {
    width: 30,
    height: 30,
  },
});
