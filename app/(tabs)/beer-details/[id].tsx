import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Button, TouchableOpacity } from 'react-native';
import Toast from '@/components/ToastAndroid';
import { useLocalSearchParams, Stack, useNavigation } from 'expo-router';
import { supabase } from '../../../utils/supabase.config.js';
import { FIRESTORE, FIREBASE_AUTH } from '../../../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { flagImages, beerImages } from '../../../data/mappers/imageMapper'
import SwitchSelector from 'react-native-switch-selector';
import { Ionicons } from '@expo/vector-icons';
import { Rating } from 'react-native-ratings';
import { getAuth } from 'firebase/auth';
import LoadingScreen from '../../../components/LoadingScreen';

export default function BeerDetails() {
  const { id } = useLocalSearchParams()
  const navigation = useNavigation()
  const [user, setUser] = useState(null);
  const userId = user?.id;
  const isUserAnonymous = !user?.app_metadata?.provider
  const [loading, setLoading] = useState(true)
  const [beer, setBeer] = useState(null)
  const [userRatings, setUserRatings] = useState({
    overallRating: 0,
    tasteRating: 0,
    aromaRating: 0,
    afterTasteRating: 0,
  })
  const [allowRating, setAllowRating] = useState(false)
  const [ratingType, setRatingType] = useState('global')
  const [countryName, setCountryName] = useState('');
  const [breweryName, setBreweryName] = useState('');
  const [beerType, setBeerType] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(user);
      }
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch beer details from Supabase
  useEffect(() => {
    const fetchBeerData = async () => {
      setLoading(true);
      try {
        // Fetch beer data
        const { data: beerData, error: beerError } = await supabase
          .from('Beer')
          .select()
          .eq('id', id)
          .single();

        if (beerError || !beerData) {
          console.error('Error fetching beer:', beerError);
          Toast.show('Error fetching beer');
          setBeer(null);
          return;
        }

        setBeer(beerData);

        // Fetch country name
        const { data: countryData, error: countryError } = await supabase
          .from('Country')
          .select('name')
          .eq('iso', beerData.countryIso)
          .single();

        if (!countryError && countryData) {
          setCountryName(countryData.name);
        } else {
          console.error('Error fetching country:', countryError);
        }

        // Fetch brewery name
        const { data: breweryData, error: breweryError } = await supabase
          .from('Brewery')
          .select('name')
          .eq('id', beerData.breweryId)
          .single();

        if (!breweryError && breweryData) {
          setBreweryName(breweryData.name);
        } else {
          console.error('Error fetching brewery:', breweryError);
        }

        // Fetch beer type
        const { data: beerType, error: beerTypeError } = await supabase
          .from('BeerType')
          .select('name')
          .eq('name', beerData.type)
          .single();

        if (!beerTypeError && beerType) {
          setBeerType(beerType.name);
        } else {
          console.error('Error fetching beer type:', beerTypeError);
        }

        // Fetch user's rating for this beer if user is logged in
        if (user) {
          const { data: userRatingData, error: userRatingError } = await supabase
            .from('UserRating')
            .select('*')
            .eq('userId', user.id)
            .eq('beerId', id)
            .single();

          if (!userRatingError && userRatingData) {
            // User has rated this beer before
            setUserRatings({
              overallRating: userRatingData.overallRating || 0,
              aromaRating: userRatingData.aromaRating || 0,
              tasteRating: userRatingData.tasteRating || 0,
              afterTasteRating: userRatingData.afterTasteRating || 0,
            });
            setAllowRating(false);  // Disable further rating
            setRatingType('user');
          } else {
            // User hasn't rated this beer, allow them to rate
            setUserRatings({
              overallRating: 0,
              tasteRating: 0,
              aromaRating: 0,
              afterTasteRating: 0,
            });
            setAllowRating(true);
            setRatingType('global');
          }
        }

      } catch (error) {
        console.error("Error fetching beer:", error);
        Toast.show('Error fetching beer');
      } finally {
        setLoading(false);
      }
    };

    fetchBeerData();
  }, [id, user]);

  useEffect(() => {
    if (loading) return;

    if (Object.values(userRatings).every(value => value === 0)) {
      setAllowRating(false)
      setRatingType('global')
    } else {
      setAllowRating(true)
      setRatingType('user')
    }
  }, [loading, userRatings]);

  const updateRating = async (category, rating) => {
    setUserRatings(prev => {
      const updatedRatings = { ...prev, [category]: rating };

      const { aromaRating, tasteRating, afterTasteRating } = updatedRatings;

      if (aromaRating && tasteRating && afterTasteRating) {
        // Calculate the overall rating
        const overallRating = (aromaRating + tasteRating + afterTasteRating) / 3;

        // Use async/await in an IIFE (Immediately Invoked Function Expression)
        (async () => {
          try {
            console.log('Updating rating for:', user.id, beer.id);

            // Await the upsert operation
            const { data, error } = await supabase
              .from('UserRating')
              .upsert(
                [
                  {
                    userId: user.id,
                    beerId: beer.id,
                    aromaRating: aromaRating,
                    tasteRating: tasteRating,
                    afterTasteRating: afterTasteRating,
                    overallRating: overallRating,
                  }
                ],
                {
                  onConflict: ['userId', 'beerId'],
                  ignoreDuplicates: false
                }
              );

            if (error) {
              console.error('Error updating rating:', error);
              Toast.show('There was an issue updating your rating.');
            } else {
              console.log('Rating saved successfully:', data);
              Toast.show('Your rating has been updated');
            }
          } catch (error) {
            console.error('Error in upsert operation:', error);
            Toast.show('There was an issue updating your rating.');
          }
        })();

        updatedRatings.overallRating = overallRating;
      }

      return updatedRatings;
    });
  };


  if (loading) {
    return <LoadingScreen />;
  }

  if (!beer) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Beer not found.</Text>
      </View>
    );
  }

  const {
    name, brewery, countryIso, type, description, abv, tags, image,
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
      <Text style={styles.subtitle}>Brewery: {breweryName || 'Unknown'}</Text>
      <View style={styles.coverContainer}>
        <Image
          source={
            image
              ? { uri: `https://dkawnlfcrjkdsivajojq.supabase.co/storage/v1/object/public/beer-images/${image}` }
              : require('../../../assets/images/placeholders/unknown-beer.png')
          }
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <View style={styles.flagContainer}>
        <Image
          source={
            countryIso
              ? { uri: `https://dkawnlfcrjkdsivajojq.supabase.co/storage/v1/object/public/flags/${countryIso}.png` }
              : require('../../../assets/images/placeholders/unknown-flag.png')
          }
          style={styles.flagImage}
        />
      </View>
      <Text style={styles.country}>Country: {countryName}</Text>
      <Text style={styles.type}>Type: {beerType}</Text>
      <Text style={styles.description}>Description: {description}</Text>
      <Text style={styles.alcohol}>ABV: {abv}%</Text>
      <Text style={styles.tags}>Tags: {tags?.join(', ')}</Text>
      <Text style={[styles.rating]}>
        Overall Rating: {ratingType === 'user' 
          ? parseFloat((userRatings.overallRating || 0).toFixed(1)) 
          : parseFloat((overallRating || 0).toFixed(1))}
      </Text>

      <Rating
        readonly
        type="custom"
        ratingColor={"#f4ce0c"}
        imageSize={50}
        ratingCount={5}
        minValue={0}
        startingValue={ratingType==='user' ? userRatings.overallRating : overallRating}
        jumpValue={0.5}
        fractions={2}
        style={{ paddingVertical: 10 }}
      />

      <Text style={[styles.detail]}>
        Global average: {overallRating ? parseFloat(overallRating.toFixed(1)) : 'N/A'}
      </Text>

      { (Object.values(userRatings).some(value => value === 0)) && (
        <TouchableOpacity
          onPress={ () => {
            if (!allowRating) {
              setAllowRating(true)
              setRatingType('user')
            } else {
              setAllowRating(false)
              setRatingType('global')
              setUserRatings({
                overallRating: 0,
                tasteRating: 0,
                aromaRating: 0,
                afterTasteRating: 0,
              });
            }
          }}
          style={[
              styles.button,
              isUserAnonymous && styles.disabledButton,
              ratingType === 'user' && styles.cancelButton
          ]}
          disabled={isUserAnonymous}
        >
          <Text style={isUserAnonymous ? styles.disabledText : styles.buttonText}>
            {ratingType === 'user' ? 'Cancel' : 'Rate'}
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
          onPress={(value) => {
            if (value === "global") {
              setRatingType("global");

              if (!Object.values(userRatings).every(rating => rating > 0)) {
                setUserRatings({
                  overallRating: overallRating || 0,
                  tasteRating: tasteRating || 0,
                  aromaRating: aromaRating || 0,
                  afterTasteRating: afterTasteRating || 0,
                });
              }

            } else if (value === "user" && allowRating) {
              setRatingType("user");
            }
          }}
        />
      </View>

      <View style={styles.row}>
        <Text style={[styles.detail]}>
          Aroma: {ratingType==='user' ? userRatings.aromaRating : aromaRating}
        </Text>
        <Rating
          readonly={!allowRating || ratingType == 'global'}
          type="custom"
          ratingColor={"#f4ce0c"}
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
          type="custom"
          ratingColor={"#f4ce0c"}
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
          type="custom"
          ratingColor={"#f4ce0c"}
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
    top: 50,
    right: 50,
  },
  flagImage: {
    width: 50,
    height: 50,
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
  cancelButton: {
    backgroundColor: 'red',
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
