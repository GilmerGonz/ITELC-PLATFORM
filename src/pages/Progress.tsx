import React, { useEffect, useState } from "react";
import SmartHeader from "@/components/SmartHeader";
import { Trophy, Star, Target, TrendingUp, Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const POINTS_PER_WEEK = 5;
const TOTAL_WEEKS = 12;
const MAX_TOTAL_POINTS = POINTS_PER_WEEK * TOTAL_WEEKS;

const Progress: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // El nivel actual viene del URL o por defecto es A1
  const currentLevel = searchParams.get("level") || "a1";
  
  const [totalPoints, setTotalPoints] = useState(0);
  const [completedWeeks, setCompletedWeeks] = useState(0);
  const [loading, setLoading] = useState(true);

  const availableCourses = [
    { id: "a1", label: "A1" },
    { id: "a2", label: "A2" },
    { id: "b1", label: "B1" },
  ];

  useEffect(() => {
    fetchGlobalProgress();
  }, [currentLevel]);

  const fetchGlobalProgress = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('user_progress')
          .select('points, lesson_id')
          .eq('user_id', user.id)
          .eq('level', currentLevel);

        if (error) throw error;

        if (data) {
          const pointsSum = data.reduce((acc, curr) => acc + Number(curr.points || 0), 0);
          const finishedWeeksCount = data.filter(curr => Number(curr.points) >= POINTS_PER_WEEK).length;

          setTotalPoints(pointsSum);
          setCompletedWeeks(finishedWeeksCount);
        } else {
          setTotalPoints(0);
          setCompletedWeeks(0);
        }
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const percentage = Math.round((totalPoints / MAX_TOTAL_POINTS) * 100) || 0;

  const handleLevelChange = (levelId: string) => {
    setSearchParams({ level: levelId });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] overflow-x-hidden">
      <SmartHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        
        {/* SELECTOR DE CURSOS */}
        <div className="flex gap-2 mb-8 bg-slate-200/50 p-1.5 rounded-2xl w-fit">
          {availableCourses.map((course) => (
            <button
              key={course.id}
              onClick={() => handleLevelChange(course.id)}
              className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all duration-300 ${
                currentLevel === course.id
                  ? "bg-white text-slate-900 shadow-sm scale-100"
                  : "text-slate-500 hover:text-slate-700 scale-95 opacity-70"
              }`}
            >
              NIVEL {course.label}
            </button>
          ))}
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-green-600" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-green-600">
              Reporte de Nivel {currentLevel.toUpperCase()}
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Tu Rendimiento Académico
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative group md:col-span-2">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-[2.5rem] opacity-20 group-hover:opacity-100 transition duration-700 blur-sm"></div>
              
              <div className="relative h-full rounded-[2.5rem] bg-white p-8 shadow-xl transition-all duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-yellow-100 p-3 rounded-2xl transform group-hover:rotate-12 transition-transform duration-300">
                    <Trophy size={32} className="text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Puntuación Total</h2>
                    <p className="text-slate-500 text-sm font-medium">Nivel {currentLevel.toUpperCase()}: {totalPoints.toFixed(1)} / {MAX_TOTAL_POINTS} pts</p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-6">
                  <div className="relative flex items-center justify-center">
                    <svg className="h-56 w-56 transform -rotate-90">
                      <circle cx="112" cy="112" r="98" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                      <motion.circle
                        initial={{ strokeDashoffset: 615.75 }}
                        animate={{ strokeDashoffset: 615.75 - (615.75 * percentage) / 100 }}
                        cx="112" cy="112" r="98" stroke="currentColor" strokeWidth="12" fill="transparent"
                        strokeDasharray={615.75}
                        strokeLinecap="round"
                        className="text-green-500 transition-all duration-[1500ms] ease-in-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center group-hover:scale-110 transition-transform duration-500">
                      <span className="text-6xl font-black text-slate-900 tracking-tighter">{totalPoints.toFixed(0)}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Puntos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-400 rounded-[2rem] opacity-20 group-hover:opacity-100 transition duration-700 blur-sm"></div>
                <div className="relative rounded-[2rem] bg-white p-7 shadow-lg transition-shadow duration-300">
                  <Target size={28} className="text-green-600 mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semanas al 100%</p>
                  <p className="text-4xl font-black text-slate-800 tracking-tighter">{completedWeeks} <span className="text-lg text-slate-300">/ 12</span></p>
                </div>
              </div>

              <div className="relative group flex-grow">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[2rem] opacity-20 group-hover:opacity-100 transition duration-700 blur-sm"></div>
                
                <div className="relative h-full rounded-[2rem] bg-slate-900 p-8 shadow-2xl text-white flex flex-col min-h-[300px] overflow-hidden">
                  <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full group-hover:bg-blue-500/40 transition-colors"></div>
                  
                  <div className="relative z-10 flex-grow">
                    <Star size={32} className={`mb-4 ${percentage >= 80 ? "text-yellow-400 fill-yellow-400 animate-bounce" : "text-white/20"}`} />
                    <p className="text-xl font-bold mb-2">
                      {percentage >= 80 ? "¡Nivel Superado!" : "Estado del Nivel"}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                      {percentage >= 80 
                      ? `Has alcanzado el puntaje necesario en el nivel ${currentLevel.toUpperCase()}. Ya puedes solicitar tu certificado oficial.` 
                      : `Llega al 100% del total del nivel ${currentLevel.toUpperCase()} para habilitar la solicitud oficial.`}
                    </p>
                  </div>
                  
                  {/* BOTÓN: SIEMPRE BLANCO Y CLICKEABLE */}
                  <Button 
                    onClick={() => console.log(`Solicitando certificado para ${currentLevel}...`)}
                    className="mt-auto relative z-30 w-full py-6 px-2 rounded-2xl font-black text-[10px] uppercase tracking-tighter flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-2xl !bg-white !text-black border-none cursor-pointer hover:!bg-slate-100 opacity-100"
                  >
                    <Send 
                      size={12} 
                      className="text-black flex-shrink-0" 
                    />
                    <span className="whitespace-nowrap">
                      SOLICITAR CERTIFICADO {currentLevel.toUpperCase()}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Progress;
