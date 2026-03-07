import { createClient } from '@supabase/supabase-js';

// Obtenemos las variables de entorno de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificación de seguridad para el desarrollador
if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "⚠️ ¡Cuidado! Las credenciales de Supabase no se encuentran.\n" +
    "Asegúrate de tener un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY."
  );
}

// Creamos el cliente con configuración de persistencia
export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    persistSession: true, // Esto mantiene al estudiante logueado aunque cierre el navegador
    autoRefreshToken: true, // Refresca el token automáticamente para que no falle al guardar progreso
    detectSessionInUrl: true,
  },
});

/**
 * Función de utilidad para verificar la conexión rápidamente
 */
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_progress').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error de conexión con Supabase:", err);
    return false;
  }
};