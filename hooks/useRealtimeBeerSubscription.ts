import { useEffect } from 'react';
import { supabase } from '../utils/supabase.config.js';

export default function useRealtimeBeerSubscription({
  breweries = [],
  setBeers,
  setGlobalRatings,
}) {
  useEffect(() => {
    const subscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Beer',
        },
        (payload) => {
          console.log('Beer change received:', payload);

          if (payload.eventType === 'INSERT') {
            const brewery = breweries.find(brew => brew.id === payload.new.breweryId);
            const newBeer = {
              ...payload.new,
              brewery: brewery.name
            };

            setBeers(currentBeers => [...currentBeers, newBeer]);

            if (payload.new.overallRating !== null && payload.new.overallRating !== undefined) {
              setGlobalRatings(currentRatings => ({
                ...currentRatings,
                [payload.new.id]: payload.new.overallRating
              }));
            }
          }
          else if (payload.eventType === 'UPDATE') {
            setBeers(currentBeers =>
              currentBeers.map(beer => {
                if (beer.id === payload.new.id) {
                  const updatedFields = {};

                  if (payload.new.name !== payload.old.name && payload.new.name !== undefined) {
                    updatedFields.name = payload.new.name;
                  }

                  if (payload.new.description !== payload.old.description && payload.new.description !== undefined) {
                    updatedFields.description = payload.new.description;
                  }

                  if (payload.new.image !== payload.old.image && payload.new.image !== undefined) {
                    updatedFields.image = payload.new.image;
                  }

                  if (payload.new.abv !== payload.old.abv && payload.new.abv !== undefined) {
                    updatedFields.abv = payload.new.abv;
                  }

                  if (payload.new.type !== payload.old.type && payload.new.type !== undefined) {
                    updatedFields.type = payload.new.type;
                  }

                  if (payload.new.tags !== payload.old.tags && payload.new.tags !== undefined) {
                    updatedFields.tags = payload.new.tags;
                  }

                  if (payload.new.countryIso !== payload.old.countryIso && payload.new.countryIso !== undefined) {
                    updatedFields.countryIso = payload.new.countryIso;
                  }

                  if (payload.new.breweryId !== payload.old.breweryId && payload.new.breweryId !== undefined) {
                    updatedFields.breweryId = payload.new.breweryId;

                    const brewery = breweries.find(brew => brew.id === payload.new.breweryId);
                    if (brewery) {
                      updatedFields.brewery = brewery.name;
                    } else {
                      updatedFields.brewery = 'Unknown Brewery';
                    }
                  }

                  if (payload.new.overallRating !== payload.old.overallRating &&
                      payload.new.overallRating !== undefined) {
                    updatedFields.overallRating = payload.new.overallRating;

                    setGlobalRatings(currentRatings => ({
                      ...currentRatings,
                      [payload.new.id]: payload.new.overallRating
                    }));
                  }

                  if (payload.new.aromaRating !== payload.old.aromaRating &&
                      payload.new.aromaRating !== undefined) {
                    updatedFields.aromaRating = payload.new.aromaRating;
                  }

                  if (payload.new.tasteRating !== payload.old.tasteRating &&
                      payload.new.tasteRating !== undefined) {
                    updatedFields.tasteRating = payload.new.tasteRating;
                  }

                  if (payload.new.afterTasteRating !== payload.old.afterTasteRating &&
                      payload.new.afterTasteRating !== undefined) {
                    updatedFields.afterTasteRating = payload.new.afterTasteRating;
                  }

                  return { ...beer, ...updatedFields };
                }
                return beer;
              })
            );
          }
          else if (payload.eventType === 'DELETE') {
            setBeers(currentBeers =>
              currentBeers.filter(beer => beer.id !== payload.old.id)
            );

            setGlobalRatings(currentRatings => {
              const newRatings = { ...currentRatings };
              delete newRatings[payload.old.id];
              return newRatings;
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [breweries, setBeers, setGlobalRatings]);
}