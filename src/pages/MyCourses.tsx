import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SmartHeader from "@/components/SmartHeader";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { 
  Compass, TowerControl, Coffee, Landmark, Mic2, Crown,
  Code2, Layout, Database, 
  PlusCircle, Atom, FlaskConical,
  Languages, Sparkles, BookOpen, Lock, Unlock, Terminal 
} from "lucide-react";

// CATEGORÍA: LANGUAGES
const languages = [
  { id: 'a1', title: "English A1", desc: "Basic expressions and fundamental phrases", duration: "12 Weeks", icon: Compass, color: "text-blue-600", bg: "bg-blue-50" },
  { id: 'a2', title: "English A2", desc: "Elementary communication and common information", duration: "12 Weeks", icon: TowerControl, color: "text-cyan-600", bg: "bg-cyan-50" },
  { id: 'b1', title: "English B1", desc: "Intermediate text comprehension and travel autonomy", duration: "12 Weeks", icon: Coffee, color: "text-amber-700", bg: "bg-amber-50" },
  { id: 'b2', title: "English B2", desc: "Upper intermediate fluency and complex arguments", duration: "12 Weeks", icon: Landmark, color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: 'c1', title: "English C1", desc: "Advanced language use for social and expert purposes", duration: "12 Weeks", icon: Mic2, color: "text-purple-600", bg: "bg-purple-50" },
  { id: 'c2', title: "English C2", desc: "Full mastery and precision in complex situations", duration: "12 Weeks", icon: Crown, color: "text-rose-600", bg: "bg-rose-50" },
  { id: 'zh', title: "Chinese HSK 1", desc: "Intro to Mandarin: Pinyin and basic characters", duration: "12 Weeks", icon: Languages, color: "text-red-600", bg: "bg-red-50" },
  { id: 'de', title: "German A1", desc: "German basics: initial grammar and vocabulary", duration: "12 Weeks", icon: BookOpen, color: "text-orange-700", bg: "bg-orange-50" },
  { id: 'it', title: "Italian A1", desc: "Italian fundamentals and phonetic structures", duration: "12 Weeks", icon: Sparkles, color: "text-emerald-700", bg: "bg-emerald-50" },
];

// CATEGORÍA: PROGRAMMING
const techCourses = [
  { id: 'python', title: "Algoritmos y Estructuras de Datos", desc: "Lógica computacional y gestión de colecciones", duration: "12 Semanas", icon: Terminal, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 'web', title: "Desarrollo Web Frontend", desc: "Interfaces modernas con HTML5, CSS3 y JavaScript", duration: "12 Semanas", icon: Layout, color: "text-orange-500", bg: "bg-orange-50" },
  { id: 'database', title: "Sistemas de Bases de Datos", desc: "Modelado relacional y consultas estructuradas SQL", duration: "12 Semanas", icon: Database, color: "text-emerald-600", bg: "bg-emerald-50" },
];

// CATEGORÍA: SCIENCES
const scienceCourses = [
  { id: 'calculo', title: "Cálculo Diferencial", desc: "Análisis de límites, continuidad y optimización", duration: "12 Semanas", icon: PlusCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: 'fisica', title: "Mecánica Clásica", desc: "Cinemática, dinámica y leyes de conservación", duration: "12 Semanas", icon: Atom, color: "text-purple-600", bg: "bg-purple-50" },
  { id: 'quimica', title: "Química General", desc: "Estructura atómica, enlaces y estequiometría", duration: "12 Semanas", icon: FlaskConical, color: "text-rose-600", bg: "bg-rose-50" },
];

const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const [unlockedLevels, setUnlockedLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('user_progress')
            .select('level')
            .eq('user_id', user.id);

          if (error) throw error;
          if (data) {
            const levels = data.map(item => item.level.toLowerCase());
            setUnlockedLevels(levels);
          }
        }
      } catch (error) {
        console.error("Error cargando permisos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  const renderGrid = (items: any[]) => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => {
        const Icon = item.icon;
        const isAvailable = unlockedLevels.includes(item.id.toLowerCase());
        
        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03, ease: "easeOut" }}
            whileHover={isAvailable ? { y: -5, borderColor: "rgb(37, 99, 235)", boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.08)" } : {}}
            whileTap={isAvailable ? { scale: 0.97 } : {}}
            onClick={() => isAvailable && navigate(`/dashboard/${item.id}`)}
            className={`group relative text-left p-8 rounded-[1.5rem] border bg-white transition-all duration-100 ${
              isAvailable ? "border-slate-200 cursor-pointer shadow-sm" : "border-slate-100 opacity-60 cursor-not-allowed"
            }`}
          >
            <div className="absolute top-6 right-6">
              {isAvailable ? (
                <Unlock size={20} className="text-amber-500 fill-amber-400/10" />
              ) : (
                <Lock size={20} className="text-slate-300" />
              )}
            </div>

            <div className={`${item.bg} ${item.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-150 ${isAvailable && "group-hover:scale-110"}`}>
              <Icon size={28} />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">
              {item.title}
            </h3>
            
            <p className="text-sm leading-relaxed text-slate-500 font-medium mb-5">
              {item.desc}
            </p>

            {/* CILINDRO CORREGIDO: BORDE UNIFORME Y CENTRADO TOTAL */}
            <div className="flex items-center gap-3">
              <div className="relative w-24 h-7 rounded-full flex items-center justify-center border-[1px] border-transparent"
                   style={{
                     background: 'linear-gradient(white, white) padding-box, linear-gradient(to right, #1e40af, #2563eb, #60a5fa) border-box'
                   }}>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-800 leading-none inline-block">
                  Duración
                </span>
              </div>
              <span className="text-sm font-bold text-slate-700">
                {item.duration}
              </span>
            </div>
            
            <div className={`mt-8 flex items-center text-[10px] font-black uppercase tracking-[0.15em] ${isAvailable ? "text-blue-600" : "text-slate-400"}`}>
              {isAvailable ? "Continuar Aprendiendo →" : "Curso Bloqueado"}
            </div>
          </motion.button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <SmartHeader />
      <motion.main className="mx-auto max-w-7xl px-6 py-12">
        <section className="mb-20">
          <div className="mb-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 mb-3">Lenguas Modernas</h2>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Idiomas</h1>
          </div>
          {loading ? (
            <div className="text-slate-400 font-bold">Cargando cursos...</div>
          ) : (
            renderGrid(languages)
          )}
        </section>

        <section className="mb-20">
          <div className="mb-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 mb-3">Ingeniería de Software</h2>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Programación</h1>
          </div>
          {renderGrid(techCourses)}
        </section>

        <section className="mb-20">
          <div className="mb-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 mb-3">Ciencias Naturales</h2>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Fundamentos de Ingeniería</h1>
          </div>
          {renderGrid(scienceCourses)}
        </section>
      </motion.main>
    </div>
  );
};

export default MyCourses;