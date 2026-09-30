import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xzyfpougokhkjyotldcv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eWZwb3Vnb2toa2p5b3RsZGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NTAwMzEsImV4cCI6MjEwNjMyNjAzMX0.eo-Xa2qvEhE-AxypJcHSQM5rmE7GBIkXHTuCpQ_LWdc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});