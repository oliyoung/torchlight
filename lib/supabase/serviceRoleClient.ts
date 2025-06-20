import { createClient } from '@supabase/supabase-js';
import { logger } from '../logger';
import { supabaseConfig } from './config';

// WARNING: SUPABASE_SERVICE_ROLE_KEY should only be used on the server-side and kept secret.
if (!supabaseConfig.serviceRoleKey) {
    logger.error('Missing NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY environment variable');
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY environment variable');
}

export const supabaseServiceRole = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);