import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zqpjtufkadoewkzncugb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcGp0dWZrYWRvZXdrem5jdWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NTQ4MzUsImV4cCI6MjEwNjMzMDgzNX0.PcAZwja92C19erHZiHGrxxnW3o_H_1rluWJCcP5yIOI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});