import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, useColorScheme } from 'react-native';
import Toast from '@/components/ToastAndroid';
import { useLocalSearchParams, Stack, useNavigation } from 'expo-router';
import { supabase } from '@/utils/supabase.config.js';
import { flagImages, beerImages } from '../../../data/mappers/imageMapper'
import SwitchSelector from 'react-native-switch-selector';
import { Ionicons } from '@expo/vector-icons';
import { Rating } from 'react-native-ratings';
import useRealtimeUserRatingSubscription from '@/hooks/useRealtimeUserRatingSubscription';
import LoadingScreen from '@/components/LoadingScreen';
import { Chip, Button } from 'react-native-paper';
import RatingComponent from '@/components/beer/RatingComponent';
import { Colors } from '@/constants/Colors';

export default function BeerDetails() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = getStyles(theme);
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const userId = user?.id;
  const isUserAnonymous = !user?.app_metadata?.provider;
  const [loading, setLoading] = useState(true);
  const [beer, setBeer] = useState(null);
  const [userRatings, setUserRatings] = useState({
    overallRating: 0,
    tasteRating: 0,
    aromaRating: 0,
    afterTasteRating: 0,
  });
  const [allowRating, setAllowRating] = useState(false);
  const [ratingType, setRatingType] = useState('global');
  const [countryName, setCountryName] = useState('');
  const [breweryName, setBreweryName] = useState('');
  const [beerType, setBeerType] = useState('');

  useRealtimeUserRatingSubscription({ user, setUserRatings });

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

  useEffect(() => {
    const fetchBeerData = async () => {
      setLoading(true);
      try {
        const { data: beerData, error: beerError } = await supabase
          .from('Beer')
          .select()
          .eq('id', id)
          .single();

        if (beerError || !beerData) {
          console.error('Error fetching beer:', beerError);
          setBeer(null);
          return;
        }

        setBeer(beerData);

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

        if (user) {
          const { data: userRatingData, error: userRatingError } = await supabase
            .from('UserRating')
            .select('*')
            .eq('userId', user.id)
            .eq('beerId', id)
            .single();

          if (!userRatingError && userRatingData) {
            setUserRatings({
              overallRating: userRatingData.overallRating || 0,
              aromaRating: userRatingData.aromaRating || 0,
              tasteRating: userRatingData.tasteRating || 0,
              afterTasteRating: userRatingData.afterTasteRating || 0,
            });
            setAllowRating(false);
            setRatingType('user');
          } else {
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
      setAllowRating(false);
      setRatingType('global');
    } else {
      setAllowRating(true);
      setRatingType('user');
    }
  }, [loading, userRatings]);

  const updateRating = async (category, rating) => {
    setUserRatings(prev => {
      const updatedRatings = { ...prev, [category]: rating };

      const { aromaRating, tasteRating, afterTasteRating } = updatedRatings;

      if (aromaRating && tasteRating && afterTasteRating) {
        const overallRating = (aromaRating + tasteRating + afterTasteRating) / 3;

        (async () => {
          try {
            console.log('Updating rating for:', user.id, beer.id);

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

  const { name, image, description, abv, tags, overallRating, aromaRating, tasteRating, afterTasteRating } = beer;

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
        <View style={styles.breweryRow}>
          <Image
            source={
              countryName
                ? { uri: `https://dkawnlfcrjkdsivajojq.supabase.co/storage/v1/object/public/flags/${beer.countryIso}.png` }
                : require('../../../assets/images/placeholders/unknown-flag.png')
            }
            style={styles.flagImage}
          />
          <Text style={styles.breweryName}>{breweryName || 'Unknown Brewery'}</Text>
        </View>

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

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.type}>Categoria</Text>
            <Text style={styles.bold}>{beerType}</Text>
          </View>

          <View style={styles.column}>
            <Text style={styles.abv}>Vol. alc.</Text>
            <Text style={styles.bold}>{abv}%</Text>
          </View>
        </View>

        {/* tags */}
        {tags && tags.length > 0 ? (
        <View style={styles.tagsContainer}>
          <View style={styles.tagsList}>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                style={[
                  styles.tagChip,
                  { backgroundColor: theme.tint },
                ]}
              >
                {tag}
              </Chip>
             ))}
           </View>
         </View>
        ) : null}

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionHeader}>Descrição</Text>
          <Text style={styles.description}>
            {description || 'Descrição indisponível'}
          </Text>
        </View>

        <Rating
          readonly
          type="custom"
          ratingColor={theme.tint}
          imageSize={50}
          ratingCount={5}
          minValue={0}
          startingValue={ratingType === 'user' ? userRatings.overallRating : overallRating}
          jumpValue={0.5}
          fractions={2}
          style={{ paddingVertical: 10 }}
        />
        <Text style={styles.overallRating}>
          {ratingType === 'user' ? userRatings.overallRating : overallRating}
        </Text>

        { (Object.values(userRatings).some(value => value === 0)) && (
        <Button
          mode="contained"
          onPress={() => {
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
          disabled={isUserAnonymous}
          style={[
            styles.button,
            isUserAnonymous && styles.disabledButton,
            ratingType === 'user' && styles.cancelButton,
          ]}
        >
          <Text style={isUserAnonymous ? styles.disabledText : styles.buttonText}>
            {ratingType === 'user' ? 'Cancelar' : 'Avaliar'}
          </Text>
        </Button>
        )}

        <View style={styles.switch}>
          <SwitchSelector
            disabled={isUserAnonymous}
            options={[
              { label: "Pessoal", value: "user", customIcon: "", disabled: isUserAnonymous || !Object.values(userRatings).some(value => value) },
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
            style={styles.switchSelector}
            selectedTextStyle={styles.selectedText}
            textStyle={styles.optionText}
            backgroundColor="#f0f0f0"
            buttonColor="#f4ce0c"
            borderColor="#f4ce0c"
            height={50}
            borderRadius={10}
          />
        </View>

        <RatingComponent
          label="Aroma"
          value={ratingType === 'user' ? userRatings.aromaRating : aromaRating}
          onFinishRating={(rating) => updateRating('aromaRating', rating)}
          readonly={!allowRating || ratingType === 'global'}
          allowRating={allowRating}
        />
        <RatingComponent
          label="Sabor"
          value={ratingType === 'user' ? userRatings.tasteRating : tasteRating}
          onFinishRating={(rating) => updateRating('tasteRating', rating)}
          readonly={!allowRating || ratingType === 'global'}
          allowRating={allowRating}
        />
        <RatingComponent
          label="Aftertaste"
          value={ratingType === 'user' ? userRatings.afterTasteRating : afterTasteRating}
          onFinishRating={(rating) => updateRating('afterTasteRating', rating)}
          readonly={!allowRating || ratingType === 'global'}
          allowRating={allowRating}
        />
      </ScrollView>
    </>
  );
}

const getStyles = (theme: typeof Colors.light | typeof Colors.dark) => StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 30,
    paddingBottom: 20,
    backgroundColor: theme.foreground,
  },
  breweryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  breweryName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  flagImage: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  coverContainer: {
    width: '100%',
    alignItems: 'center',
    height: 330,
    marginBottom: 30,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  column: {
    flexDirection: 'column',
    alignItems: 'left',
    width: '60%'
  },
  type: {
    fontSize: 16,
  },
  abv: {
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  descriptionContainer: {
    marginTop: 20,
  },
  descriptionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: theme.text,
  },
  rating: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  error: {
    fontSize: 20,
    color: 'red',
    textAlign: 'center',
  },
  tagsContainer: {
    marginTop: 10,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 14,
    backgroundColor: theme.tint,
    padding: 5,
    borderRadius: 10,
    marginRight: 8,
  },
  tagChip: {
    marginRight: 8,
  },
  button: {
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.tint,
  },
  disabledButton: {
    backgroundColor: theme.disabled,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  disabledText: {
    color: theme.placeholderText,
  },
  switchSelector: {
    marginTop: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  selectedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  optionText: {
    fontSize: 14,
    color: theme.text,
  },
  overallRating: {
    fontSize: 16,
    color: theme.text,
    textAlign: 'center',

  },
});
