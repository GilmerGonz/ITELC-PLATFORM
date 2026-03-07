import { useEffect, useState } from "react";
import { Navigate, Outlet, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
        {/* ICONO PLANO: Sin sombras y fondo sutil */}
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-red-50 text-red-500">
          <ShieldAlert size={48} strokeWidth={2.5} />
        </div>

        <h1 className="max-w-md text-4xl font-black leading-tight tracking-tighter text-slate-900 md:text-5xl">
          NO ESTÁS REGISTRADO EN ESTA PLATAFORMA :(
        </h1>
        
        <p className="mt-6 max-w-sm text-lg font-medium text-slate-500">
          Parece que intentaste acceder a una zona restringida sin iniciar sesión.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
          >
            Ir al inicio de sesión
          </Link>
          
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-8 py-4 text-lg font-bold text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
          >
            <ArrowLeft size={20} />
            Volver
          </Link>
        </div>

        <div className="mt-16 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
          ITELC Platform &copy; 2026
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;