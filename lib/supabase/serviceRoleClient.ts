import { createClient } from '@supabase/supabase-js';
import { logger } from '../logger';

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// WARNING: SUPABASE_SERVICE_ROLE_KEY should only be used on the server-side and kept secret.
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    logger.error({ supabaseServiceRoleKey, supabaseUrl }, 'Missing Supabase environment variables for service role client');
    throw new Error('Missing Supabase environment variables for service role client');
}

export const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey);