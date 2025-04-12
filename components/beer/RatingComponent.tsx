import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Rating } from 'react-native-ratings';
import { Colors } from '@/constants/Colors';

const RatingComponent = ({
  label,
  value,
  onFinishRating,
  readonly,
  allowRating,
}) => {

  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = getStyles(theme);

  return (
    <View style={styles.row}>
      <View style={styles.textContainer}>
        <Text style={styles.detail}>
          {label}: {value}
        </Text>
      </View>
      <View style={styles.ratingContainer}>
        <Rating
          readonly={readonly}
          type="custom"
          ratingColor={theme.tint}
          imageSize={35}
          ratingCount={5}
          minValue={0}
          startingValue={value}
          jumpValue={0.5}
          fractions={2}
          onFinishRating={onFinishRating}
          style={styles.ratingStyle}
        />
      </View>
    </View>
  );
};

const getStyles = (theme: typeof Colors.light | typeof Colors.dark) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  textContainer: {
    flex: 1,
  },
  detail: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    marginRight: 35,
  },
  ratingStyle: {
    paddingVertical: 10,
  },
});

export default RatingComponent;