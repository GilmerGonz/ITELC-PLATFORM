import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Eye, EyeOff, LogIn, GraduationCap, User, ShieldCheck, Settings } from "lucide-react";
import ITELCLogo from "../components/ITELCLogo";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");

  const isTeacher = role === "teacher";
  const isAdmin = role === "admin";
  const isStudent = role === "student";

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const bgVariants = {
    student: { backgroundColor: "#f8fafc" },
    teacher: { backgroundColor: "#002466" }, 
    admin: { backgroundColor: "#0F172A" } 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (authError) {
        toast.error("Credenciales incorrectas.");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          await supabase.auth.signOut();
          toast.error("Error de perfil.");
          setIsLoading(false);
          return;
        }

        if (role !== profile.role) {
          await supabase.auth.signOut();
          toast.error(`Acceso denegado: Tu cuenta no es de ${role}.`);
          setIsLoading(false);
          return;
        }

        toast.success(`Bienvenido, ${profile.role}`);
        const routes = { admin: "/admin-dashboard", teacher: "/teacher-dashboard", student: "/dashboard" };
        navigate(routes[profile.role as keyof typeof routes]);
      }
    } catch (err) {
      toast.error("Error de conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  const RoleButton = ({ targetRole, icon: Icon, label }: { targetRole: typeof role, icon: any, label: string }) => {
    const isActive = role === targetRole;
    
    return (
      <button
        type="button"
        onClick={() => setRole(targetRole)}
        className={`relative flex flex-1 items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-300 z-10 ${
          isActive 
            ? (targetRole === "student" ? "bg-white text-blue-600 shadow-sm" : 
               targetRole === "teacher" ? "bg-[#002466] text-white" : "bg-slate-900 text-white") 
            : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
        }`}
      >
        <Icon size={14} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <motion.div 
      initial={false}
      animate={role}
      variants={bgVariants}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 transition-colors duration-700"
    >
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="z-10 w-full max-w-md">
        {/* TARJETA CON BORDES REFORZADOS EN TODOS LOS MODOS */}
        <div className={`rounded-[2.5rem] border p-10 bg-white transition-all duration-500 shadow-2xl shadow-black/10
          ${isTeacher ? "border-blue-400/40" : isAdmin ? "border-slate-500/40" : "border-slate-200"}`}
        >
          <motion.div variants={itemVariants} className="mb-8 flex flex-col items-center">
            <div className="mb-6">
              <ITELCLogo size="lg" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-blue-950 text-center leading-tight">
              {isAdmin ? "Admin Console" : isTeacher ? "Portal Docente" : "Welcome back"}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mt-3 text-slate-400">
              ITELC Institutional System
            </p>
          </motion.div>

          {/* Selector con borde constante */}
          <motion.div variants={itemVariants} className="mb-8 flex p-1.5 rounded-2xl border border-slate-200 bg-slate-50/50">
            <RoleButton targetRole="student" icon={User} label="Estudiante" />
            <RoleButton targetRole="teacher" icon={GraduationCap} label="Profesor" />
            <RoleButton targetRole="admin" icon={Settings} label="Admin" />
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1 text-slate-500">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-5 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                placeholder="usuario@itelc.com"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1 text-slate-500">Security Key</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/30 px-5 py-4 text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className={`w-full rounded-2xl py-7 text-sm font-black text-white transition-all duration-500 shadow-lg ${
                  isAdmin ? "bg-slate-900 shadow-slate-900/20" : isTeacher ? "bg-[#002466] shadow-blue-900/20" : "bg-blue-600 shadow-blue-600/20"
                }`}
                disabled={isLoading}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.span key="L" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Procesando...
                    </motion.span>
                  ) : (
                    <motion.span key="T" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 uppercase tracking-widest">
                      {isStudent ? <LogIn size={18} /> : <ShieldCheck size={20} />}
                      Ingresar
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-10 flex flex-col items-center gap-4 text-[9px] font-bold uppercase tracking-[0.4em] text-slate-300">
            <div className="h-[1px] w-8 bg-slate-100" />
            <p>ITELC PLATFORM © 2026</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;