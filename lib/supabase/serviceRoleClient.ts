import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// WARNING: SUPABASE_SERVICE_ROLE_KEY should only be used on the server-side and kept secret.
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables for service role client');
}

export const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey);