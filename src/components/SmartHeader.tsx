import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import ITELCLogo from "@/components/ITELCLogo";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Actualizamos los navItems para incluir "Mis Cursos"
const navItems = [
  { label: "Inicio", path: "/dashboard" },
  { label: "Mis Cursos", path: "/my-courses" }, // Nueva ubicación estratégica
  { label: "Tips", path: "/tips" },
  { label: "Mi Progreso", path: "/progress" },
];

const SmartHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.user_metadata?.full_name || user.email);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Sesión cerrada correctamente");
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo Section */}
        <Link to="/dashboard" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
          <ITELCLogo size="sm" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all active:scale-95 ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
          
          <div className="ml-4 flex items-center gap-3 border-l pl-4 border-slate-200">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estudiante</span>
              <span className="text-xs font-bold text-slate-700 max-w-[120px] truncate">
                {userEmail || "Cargando..."}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="group flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-all hover:bg-red-50 hover:text-red-600 active:scale-90"
              title="Cerrar sesión"
            >
              <LogOut size={18} className="transition-transform group-hover:-translate-x-0.5" />
            </button>
          </div>
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-3 md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="absolute inset-x-0 top-16 border-b border-slate-200 bg-white p-4 shadow-xl md:hidden animate-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold ${
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600"
                }`}
              >
                {item.label}
                {location.pathname === item.path && <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
              </Link>
            ))}
            <hr className="my-2 border-slate-100" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default SmartHeader;