// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Add your own Supabase URL and Anon Key here
const supabaseUrl = ''; 
const supabaseAnonKey = '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
