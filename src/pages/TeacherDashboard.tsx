import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  Search, 
  RefreshCw,
  GraduationCap,
  Calendar,
  ChevronRight,
  LogOut 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ITELCLogo from "../components/ITELCLogo";

interface Student {
  id: string;
  name: string;
  progress: number;
  lastActivity: string;
  grade: string;
}

const TeacherDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("Docente ITELC");

  const averageProgress = useMemo(() => {
    if (students.length === 0) return 0;
    const total = students.reduce((acc, s) => acc + s.progress, 0);
    return Math.round(total / students.length);
  }, [students]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('teacher-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_progress' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if (prof) setUserName(prof.full_name);

      // 1. Obtenemos tus alumnos asignados
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, updated_at')
        .eq('teacher_id', user.id)
        .eq('role', 'student');

      if (error) throw error;

      // 2. Obtenemos TODO el progreso (Sin filtrar por teacher_id aquí para evitar que se pierdan datos)
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('user_id, points');

      const formattedStudents = (profiles || []).map((profile) => {
        // FILTRADO LOCAL: Sumamos los puntos que pertenezcan al ID del alumno actual
        const totalPoints = (progressData || [])
          .filter(p => p.user_id === profile.id)
          .reduce((acc, curr) => acc + (Number(curr.points) || 0), 0);
        
        // Calculamos sobre 60ptos según tus instrucciones
        const progressPercentage = Math.min(Math.round((totalPoints / 60) * 100), 100);

        return {
          id: profile.id,
          name: profile.full_name || "Estudiante ITELC",
          progress: progressPercentage,
          lastActivity: profile.updated_at 
            ? new Date(profile.updated_at).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) 
            : "Sin actividad",
          grade: `${totalPoints.toFixed(1)}/60`
        };
      });

      setStudents(formattedStudents);
    } catch (error) {
      console.error("Error cargando Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <ITELCLogo size="sm" />
            <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 hidden md:block">
              Portal Docente
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Docente</p>
              <p className="text-sm font-bold text-[#0F172A]">{userName}</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-100 hidden sm:block" />
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-600 transition-all">
              <LogOut size={20} />
              <span className="text-xs font-bold hidden md:block">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2 block">OVERVIEW GENERAL</span>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tight">Panel de <span className="text-blue-600">Control</span></h1>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <StatsCard title="Total Alumnos" value={students.length} icon={<Users size={20}/>} color="blue" />
          <StatsCard title="Promedio Gral" value={`${averageProgress}%`} icon={<TrendingUp size={20}/>} color="green" />
          <StatsCard title="Fecha" value={new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} icon={<Calendar size={20}/>} color="indigo" />
        </div>

        <motion.div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar estudiante..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-50 bg-slate-50/50 outline-none focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-medium"
              />
            </div>
            
            <button 
              onClick={fetchData} 
              disabled={loading}
              className="flex items-center gap-3 px-6 py-4 bg-[#0F172A] text-white rounded-2xl text-[11px] font-black tracking-widest uppercase hover:opacity-90 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "SINCRONIZANDO" : "SINCRONIZAR"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50/30">
                  <th className="px-8 py-5 text-left">Estudiantes</th>
                  <th className="px-8 py-5 text-left">Progreso (60ptos)</th>
                  <th className="px-8 py-5 text-left">Nota</th>
                  <th className="px-8 py-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="wait">
                  {loading && students.length === 0 ? (
                    <tr key="loading">
                      <td colSpan={4} className="py-20 text-center text-slate-400 font-bold italic">
                        Actualizando información...
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => (
                      <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="group hover:bg-slate-50/80 transition-all">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <GraduationCap size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-[#0F172A]">{student.name}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase">Visto: {student.lastActivity}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="w-40">
                            <span className="text-[10px] font-black text-slate-400 mb-1 block">{student.progress}%</span>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 transition-all" style={{ width: `${student.progress}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-lg font-black text-[#0F172A]">{student.grade}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-white transition-all">
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

const StatsCard = ({ title, value, icon, color }: any) => {
  const colorStyles: any = {
    blue: "bg-white border-slate-100 text-blue-600 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/5",
    green: "bg-gradient-to-br from-[#4ade80] to-[#16a34a] text-white border-transparent",
    indigo: "bg-white border-slate-100 text-indigo-600 hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-600/5"
  };

  const iconBgStyles: any = {
    blue: "bg-blue-50",
    green: "bg-white/20",
    indigo: "bg-indigo-50"
  };

  return (
    <div className={`p-8 rounded-[2rem] border transition-all duration-300 ${colorStyles[color]}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${iconBgStyles[color]}`}>{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{title}</span>
      </div>
      <h3 className="text-3xl font-black">{value}</h3>
    </div>
  );
};

export default TeacherDashboard;