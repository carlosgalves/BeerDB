import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Button, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useNavigation } from 'expo-router';
import { FIRESTORE, FIREBASE_AUTH } from '../../../firebaseConfig';
import { doc, getDoc, updateDoc, collection, setDoc } from 'firebase/firestore';
import { flagImages, beerImages} from '../../../data/mappers/imageMapper'
import SwitchSelector from 'react-native-switch-selector'
import { Ionicons } from '@expo/vector-icons';
import { Rating } from 'react-native-ratings';
import { getAuth } from 'firebase/auth';


export default function BeerDetails() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [beer, setBeer] = useState();
  const [showRatingFields, setShowRatingFields] = useState(false);
  const [userRatings, setUserRatings] = useState({
    overallRating: null,
    tasteRating: null,
    aromaRating: null,
    afterTasteRating: null,
  });
  const [ratingType, setRatingType] = useState('global')

  const navigation = useNavigation()
  const user = getAuth().currentUser
  const userId = user.uid
  const isUserAnonymous = user.isAnonymous

  console.log(userRatings)

  useEffect(() => {
    setLoading(true)

    if (!userRatings || Object.values(userRatings).every(value => value === null || 0)) {
      setShowRatingFields(false);
    } else {
      setShowRatingFields(true);
    }

    async function fetchBeerData() {
      setUserRatings({
        overallRating: null,
        tasteRating: null,
        aromaRating: null,
        afterTasteRating: null,
      });
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
            setRatingType('user');
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

  useEffect(() => {
    if (Object.values(userRatings).every(value => value === null || 0)) {
      setShowRatingFields(false);
    } else {
      setShowRatingFields(true);
    }
  }, [userRatings]);

  async function fetchUserRating(beerId) {
    if (!userId) return null;

    const ratingRef = doc(FIRESTORE, 'beers', beerId, 'ratings', userId);

    try {
      const ratingDoc = await getDoc(ratingRef);
      return ratingDoc.exists() ? ratingDoc.data() : null;
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  }

  const updateRating = async (category, rating) => {
    setUserRatings(prev => {
      const updatedRatings = { ...prev, [category]: rating };

      const { aromaRating, tasteRating, afterTasteRating } = updatedRatings;

      if (aromaRating && tasteRating && afterTasteRating) {
        try {
          const beerRef = doc(FIRESTORE, 'beers', id);
          const userRatingRef = doc(beerRef, 'ratings', userId);

          const overallRating = (aromaRating + tasteRating + afterTasteRating) / 3;

          setDoc(userRatingRef,
            { userId, aromaRating, tasteRating, afterTasteRating, overallRating },
            { merge: true }
          );

          updatedRatings.overallRating = overallRating;

          Alert.alert('Success', 'Your rating has been updated!');
        } catch (error) {
          console.error('Error updating rating:', error);
          Alert.alert('Error', 'There was an issue updating your rating. Please try again later.');
        }
      }
      return updatedRatings;
    });
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
      <Text style={styles.tags}>Tags: {tags?.join(', ')}</Text>
      <Text style={styles.rating}>Overall Rating: {overallRating} | {userRatings.overallRating}</Text>
      <Rating
        readonly
        type="star"
        imageSize={40}
        ratingCount={5}
        minValue={0}
        startingValue={userRatings.overallRating}
        jumpValue={0.5}
        fractions={2}
        style={{ paddingVertical: 10 }}
      />


      <Text style={[styles.detail]}>Aroma: {userRatings.aromaRating} | {aromaRating}</Text>
      <Text style={styles.detail}>Taste: {userRatings.tasteRating} | {tasteRating}</Text>
      <Text style={styles.detail}>Aftertaste: {userRatings.afterTasteRating} | {afterTasteRating}</Text>


      <SwitchSelector
        options={[
          { label: "User", value: "user", customIcon: "", disabled: isUserAnonymous || !Object.values(userRatings).some(value => value) },
          { label: "global", value: "global", customIcon: "" }
        ]}
        initial={userRatings && Object.values(userRatings).some(value => value) ? 0 : 1}
        onPress={(value) => setRatingType(value)}
      />
      <Rating
        readonly
        type="star"
        imageSize={40}
        ratingCount={5}
        minValue={0}
        startingValue={ratingType==='user' ? userRatings.aromaRating : aromaRating}
        jumpValue={0.5}
        fractions={2}
        style={{ paddingVertical: 10 }}
      />
      <Rating
        readonly
        type="star"
        imageSize={40}
        ratingCount={5}
        minValue={0}
        startingValue={ratingType==='user' ? userRatings.tasteRating : tasteRating}
        jumpValue={0.5}
        fractions={2}
        style={{ paddingVertical: 10 }}
      />
      <Rating
        readonly
        type="star"
        imageSize={40}
        ratingCount={5}
        minValue={0}
        startingValue={ratingType==='user' ? userRatings.afterTasteRating : afterTasteRating}
        jumpValue={0.5}
        fractions={2}
        style={{ paddingVertical: 10 }}
      />

      { (!showRatingFields && !isUserAnonymous) && (
        <Button title="Rate" onPress={() => setShowRatingFields(true)} />
      )}
      {showRatingFields && (
        <>
        <Rating
          showRating
          type="star"
          imageSize={40}
          ratingCount={5}
          minValue={0}
          startingValue={userRatings.aromaRating}
          jumpValue={0.5}
          fractions={2}
          onFinishRating={(rating) => updateRating('aromaRating', rating)}
          style={{ paddingVertical: 10 }}
        />
        <Rating
          showRating
          type="star"
          imageSize={40}
          ratingCount={5}
          minValue={0}
          startingValue={userRatings.tasteRating}
          jumpValue={0.5}
          fractions={2}
          onFinishRating={(rating) => updateRating('tasteRating', rating)}
          style={{ paddingVertical: 10 }}
        />
        <Rating
          showRating
          type="star"
          imageSize={40}
          ratingCount={5}
          minValue={0}
          startingValue={userRatings.afterTasteRating}
          jumpValue={0.5}
          fractions={2}
          onFinishRating={(rating) => updateRating('afterTasteRating', rating)}
          style={{ paddingVertical: 10 }}
        />
      </>
    )}
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
