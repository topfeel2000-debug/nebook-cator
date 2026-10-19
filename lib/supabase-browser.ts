import { createClient } from '@supabase/supabase-js';

// These are the project's public client settings. Publishable keys are meant
// to be included in browser apps; never put a service-role or secret key here.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ijmifqgjhbfcjzpdlvoh.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_0tqX91fZ-eTTa_feCjWf5A_AoSWVxBP';

export const supabase = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

export const supabaseAuthConfigured = Boolean(supabase);
