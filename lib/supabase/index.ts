// Re-export client utilities for convenience
export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient } from './server'

// Legacy export for backward compatibility - prefer using createBrowserClient or createServerClient
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);