import { useEffect } from 'react';
import { supabase } from '../utils/supabase.config.js';

export default function useRealtimeBrewerySubscription({
  setBreweries,
}) {
  useEffect(() => {
    const subscription = supabase
      .channel('brewery-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Brewery',
        },
        (payload) => {
          console.log('Brewery change received:', payload);

          if (payload.eventType === 'INSERT') {
            setBreweries(currentBreweries => [...currentBreweries, payload.new]);
          }
          else if (payload.eventType === 'UPDATE') {
            setBreweries(currentBreweries =>
              currentBreweries.map(brewery =>
                brewery.id === payload.new.id ? { ...brewery, ...payload.new } : brewery
              )
            );
          }
          else if (payload.eventType === 'DELETE') {
            setBreweries(currentBreweries =>
              currentBreweries.filter(brewery => brewery.id !== payload.old.id)
            );
          }
        }


      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [setBreweries]);
}