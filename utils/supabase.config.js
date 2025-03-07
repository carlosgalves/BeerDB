import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dkawnlfcrjkdsivajojq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrYXdubGZjcmprZHNpdmFqb2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExOTI1NzYsImV4cCI6MjA1Njc2ODU3Nn0.YfYxd8qTjUh2t4aBCfSO_zAjaFsxLOzw2tPHHCSpVMY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
