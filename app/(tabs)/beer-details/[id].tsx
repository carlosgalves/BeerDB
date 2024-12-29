import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Button, TouchableOpacity, ToastAndroid } from 'react-native';
import { useLocalSearchParams, Stack, useNavigation } from 'expo-router';
import { FIRESTORE, FIREBASE_AUTH } from '../../../firebaseConfig';
import { doc, getDoc, updateDoc, collection, setDoc } from 'firebase/firestore';
import { flagImages, beerImages} from '../../../data/mappers/imageMapper'
import SwitchSelector from 'react-native-switch-selector'
import { Ionicons } from '@expo/vector-icons';
import { Rating } from 'react-native-ratings';
import { getAuth } from 'firebase/auth';


export default function BeerDetails() {
  const { id } = useLocalSearchParams()
  const navigation = useNavigation()
  const user = getAuth().currentUser
  const userId = user.uid
  const isUserAnonymous = user.isAnonymous
  const [loading, setLoading] = useState(true)
  const [beer, setBeer] = useState()
  const [userRatings, setUserRatings] = useState({
    overallRating: null,
    tasteRating: null,
    aromaRating: null,
    afterTasteRating: null,
  })
  const [allowRating, setAllowRating] = useState(false)
  const [ratingType, setRatingType] = useState('global')

  const showToast = (msg) => {
    ToastAndroid.show(msg, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  };


  useEffect(() => {
    setLoading(true)

    // Reset de classificações não submetidas
    setAllowRating(false);
    setRatingType('global');
    setUserRatings({
      overallRating: null,
      tasteRating: null,
      aromaRating: null,
      afterTasteRating: null,
    });

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
          }
        } else {
          console.log('No such beer!');
        }
      } catch (error) {
        console.error("Error fetching beer:", error);
        showToast('Error fetching beer')
      } finally {
        setLoading(false);
      }
    }
    fetchBeerData();
  }, [id]);

  useEffect(() => {
    if (loading) return;

    if (Object.values(userRatings).every(value => value === null || 0)) {
      setAllowRating(false)
      setRatingType('global')
    } else {
      setAllowRating(true)
      setRatingType('user')
    }
  }, [loading, userRatings]);

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

          showToast('Your rating has been updated')

        } catch (error) {
          console.error('Error updating rating:', error);
          showToast('There was an issue updating your rating.')
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
      <Text style={[styles.rating]}>
        Overall Rating: {ratingType === 'user' 
          ? parseFloat((userRatings.overallRating || 0).toFixed(2)) 
          : parseFloat((overallRating || 0).toFixed(2))}
      </Text>

      <Rating
        readonly
        type="star"
        imageSize={50}
        ratingCount={5}
        minValue={0}
        startingValue={userRatings.overallRating}
        jumpValue={0.5}
        fractions={2}
        style={{ paddingVertical: 10 }}
      />
      { Object.values(userRatings).some(value => value) && (
        <Text style={[styles.detail]}>
          Global average: {parseFloat(overallRating.toFixed(2))}
        </Text>
      )}

      { (!allowRating) && (
        <TouchableOpacity
          onPress={ () => {
            setAllowRating(true)
            setRatingType('user')}
          }
          style={[
              styles.button,
              isUserAnonymous && styles.disabledButton,
          ]}
          disabled={isUserAnonymous}
        >
          <Text style={isUserAnonymous ? styles.disabledText : styles.buttonText}>
            Rate
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.switch}>
        <SwitchSelector
          disabled={isUserAnonymous}
          options={[
            { label: "User", value: "user", customIcon: "", disabled: isUserAnonymous || !Object.values(userRatings).some(value => value) },
            { label: "Global", value: "global", customIcon: "" }
          ]}
          initial={ratingType === 'user' ? 0 : 1}
          value={ratingType === 'user' ? 0 : 1}
          onPress={(value) => setRatingType(value)}
        />
      </View>

      <View style={styles.row}>
        <Text style={[styles.detail]}>
          Aroma: {ratingType==='user' ? userRatings.aromaRating : aromaRating}
        </Text>
        <Rating
          readonly={!allowRating || ratingType == 'global'}
          type="star"
          imageSize={35}
          ratingCount={5}
          minValue={0}
          startingValue={ratingType==='user' ? userRatings.aromaRating : aromaRating}
          jumpValue={0.5}
          fractions={2}
          onFinishRating={(rating) => updateRating('aromaRating', rating)}
          style={{ paddingVertical: 10 }}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.detail}>
          Taste: {ratingType==='user' ? userRatings.tasteRating : tasteRating}
        </Text>
        <Rating
          readonly={!allowRating || ratingType == 'global'}
          type="star"
          imageSize={35}
          ratingCount={5}
          minValue={0}
          startingValue={ratingType==='user' ? userRatings.tasteRating : tasteRating}
          jumpValue={0.5}
          fractions={2}
          onFinishRating={(rating) => updateRating('tasteRating', rating)}
          style={{ paddingVertical: 10 }}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.detail}>
          Aftertaste: {ratingType==='user' ? userRatings.afterTasteRating : afterTasteRating}
        </Text>
        <Rating
          readonly={!allowRating || ratingType == 'global'}
          type="star"
          imageSize={35}
          ratingCount={5}
          minValue={0}
          startingValue={ratingType==='user' ? userRatings.afterTasteRating : afterTasteRating}
          jumpValue={0.5}
          fractions={2}
          onFinishRating={(rating) => updateRating('afterTasteRating', rating)}
          style={{ paddingVertical: 10 }}
        />
      </View>

    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 20,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    flex: 1,
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
  switch: {
    marginTop: 20
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
  },
  disabledText: {
    color: '#a9a9a9',
  }
});
