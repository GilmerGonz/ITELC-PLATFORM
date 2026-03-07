import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle, ChevronRight, LayoutDashboard, User, Trophy, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const weeks = [
  { id: 1, title: 'Saludos y verbo "To Be"', description: "Presentaciones, saludos formales e informales." },
  { id: 2, title: "Información y Números", description: "Edades, números de teléfono y datos personales." },
  { id: 3, title: "Objetos y Lugares", description: "Vocabulario del hogar y preposiciones de lugar." },
  { id: 4, title: "Rutina Diaria", description: "Verbos de acción y expresiones de tiempo." },
  { id: 5, title: "Familia y Amigos", description: "Miembros de la familia y adjetivos posesivos." },
  { id: 6, title: "Comida y Restaurantes", description: "Cómo ordenar comida y vocabulario de alimentos." },
  { id: 7, title: "El Clima y Ropa", description: "Estaciones del año y vestimenta adecuada." },
  { id: 8, title: "Habilidades (Can/Can't)", description: "Expresa lo que puedes y no puedes hacer." },
  { id: 9, title: "Pasado Simple", description: "Introducción a eventos que ya sucedieron." },
  { id: 10, title: "Planes Futuros", description: "Uso de 'Going to' para planes y metas." },
  { id: 11, title: "Comparativos", description: "Aprende a comparar objetos y personas." },
  { id: 12, title: "Repaso Final", description: "Consolidación de todo el nivel A1." },
];

const Index = () => {
  const navigate = useNavigate();
  const [userProgress, setUserProgress] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Estudiante");

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "Estudiante");

        const { data, error } = await supabase
          .from('user_progress')
          .select('lesson_id, completed_count, points')
          .eq('user_id', user.id);

        if (error) throw error;

        const progressMap = data.reduce((acc: any, curr: any) => {
          acc[curr.lesson_id] = curr;
          return acc;
        }, {});

        setUserProgress(progressMap);
      }
    } catch (error) {
      console.error("Error cargando progreso:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Trophy className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800 uppercase">ITELC <span className="text-blue-600">English</span></span>
          </div>
          
          <nav className="flex items-center gap-8">
            <button className="text-blue-600 font-bold flex items-center gap-2 text-sm">
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button 
              onClick={() => navigate("/progress")} 
              className="text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-2 text-sm transition-all"
            >
              <User size={18} /> Mi Progreso
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-12">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight capitalize">¡Hola, {userName}! 👋</h1>
          <p className="text-slate-500 mt-2 text-lg">Tu camino al nivel A1: {Object.keys(userProgress).length} de 12 semanas iniciadas.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {weeks.map((week, index) => {
            const progress = userProgress[week.id];
            const completedExercises = progress?.completed_count || 0;
            const percentage = Math.min((completedExercises / 20) * 100, 100);
            const isFinished = completedExercises >= 20;

            return (
              <div 
                key={week.id}
                onClick={() => navigate(`/lesson/${week.id}`)}
                className="group relative cursor-pointer rounded-[2rem] border-2 border-white bg-white p-8 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${
                    isFinished 
                    ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                    : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                  }`}>
                    {isFinished ? <CheckCircle size={28} /> : <BookOpen size={28} />}
                  </div>
                  {isFinished && (
                    <div className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-black tracking-widest text-green-700 uppercase">
                      Lección Completa
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Módulo {week.id}</span>
                  <h3 className="mt-2 text-2xl font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{week.title}</h3>
                  <p className="mt-3 text-slate-500 text-sm leading-relaxed">{week.description}</p>
                </div>

                {/* Barra de Progreso Dinámica - ACTUALIZADA A VERDE */}
                <div className="relative pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progreso semanal</span>
                    <span className="text-xs font-bold text-slate-700">{completedExercises}/20</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-50">
                    <div 
                      className="h-full rounded-full bg-green-500 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(34,197,94,0.4)]" 
                      style={{ 
                        width: `${percentage}%`,
                        minWidth: completedExercises > 0 ? '4%' : '0%' 
                      }}
                    />
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-blue-600 transition-all group-hover:gap-4">
                  {completedExercises > 0 
                    ? (isFinished ? 'Repasar contenido' : 'Continuar lección') 
                    : 'Empezar ahora'} 
                  <ChevronRight size={18} />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Index;