import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// IMPORTANTE: Esta es la Service Role Key, NO la Anon Key
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false // Esto evita que te cierre TU sesión de admin
  }
});