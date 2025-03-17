import { useEffect } from 'react';
import { supabase } from '../utils/supabase.config.js';

export default function useRealtimeUserRatingSubscription({
  user,
  setUserRatings
}) {
  useEffect(() => {
    const subscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'UserRating',
        },
        (payload) => {
          console.log('UserRating change received:', payload);

          if (!user) return;

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (payload.new && payload.new.userId === user.id) {
              setUserRatings(currentRatings => {
                const newRatings = { ...currentRatings };

                if (payload.new.overallRating !== undefined) {
                  newRatings[payload.new.beerId] = payload.new.overallRating;
                }

                return newRatings;
              });
            }
          }
          else if (payload.eventType === 'DELETE') {
            if (payload.old && payload.old.userId === user.id) {
              setUserRatings(currentRatings => {
                const newRatings = { ...currentRatings };
                delete newRatings[payload.old.beerId];
                return newRatings;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, setUserRatings]);
}