import { useEffect } from 'react';
import { supabase } from '../utils/supabase.config.js';

export default function useRealtimeCountrySubscription({
  setCountries,
}) {
  useEffect(() => {
    const subscription = supabase
      .channel('country-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Country',
        },
        (payload) => {
          console.log('Country change received:', payload);

          if (payload.eventType === 'INSERT') {
            setCountries(currentCountries => [...currentCountries, payload.new]);
          }
          else if (payload.eventType === 'UPDATE') {
            setCountries(currentCountries =>
              currentCountries.map(country =>
                country.id === payload.new.id ? { ...country, ...payload.new } : country
              )
            );
          }
          else if (payload.eventType === 'DELETE') {
            setCountries(currentCountries =>
              currentCountries.filter(country => country.id !== payload.old.id)
            );
          }
        }


      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [setCountries]);
}