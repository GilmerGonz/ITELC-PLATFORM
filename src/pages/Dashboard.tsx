import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Check, Loader2, BookOpen, PlayCircle, Trophy, Zap } from "lucide-react";
import SmartHeader from "@/components/SmartHeader";

import { levelA1Data } from "@/data/levelA1";
import { levelA2Data } from "@/data/levelA2";
import { levelB1Data } from "@/data/levelB1"; // <--- 1. IMPORTA TU NUEVO ARCHIVO

const POINTS_PER_WEEK = 5;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const currentLevel = (courseId || "a1").toLowerCase();

  // 2. ACTUALIZACIÓN: Mapeo dinámico para soportar múltiples niveles
  const dataMap: Record<string, any> = {
    a1: levelA1Data,
    a2: levelA2Data,
    b1: levelB1Data, // <--- Ahora el dashboard sabe qué cargar para b1
  };

  const rawData = dataMap[currentLevel] || levelA1Data;
  
  const [weeks, setWeeks] = useState<any[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProgress();
  }, [currentLevel]);

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: progressData } = await supabase
        .from('user_progress')
        .select('lesson_id, points')
        .eq('user_id', user.id)
        .eq('level', currentLevel);

      const sum = progressData?.reduce((acc, curr) => acc + Number(curr.points || 0), 0) || 0;
      setTotalPoints(sum);

      const updatedWeeks = Object.entries(rawData).map(([weekNum, weekData]: [string, any]) => {
        const weekId = Number(weekNum);
        const prog = progressData?.find(d => Number(d.lesson_id) === weekId);
        let calculatedProgress = prog ? Math.round((Number(prog.points) / POINTS_PER_WEEK) * 100) : 0;
        
        return { 
          week: weekId,
          title: weekData.title,
          progress: Math.min(calculatedProgress, 100),
        };
      });

      setWeeks(updatedWeeks.sort((a, b) => a.week - b.week));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const MAX_POINTS = weeks.length * POINTS_PER_WEEK;
  const globalPercentage = Math.round((totalPoints / (MAX_POINTS || 1)) * 100) || 0;
  
  const isLevelFinished = globalPercentage === 100;
  const currentLesson = weeks.find(w => w.progress < 100) || weeks[weeks.length - 1];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SmartHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2 block">
            NIVEL {currentLevel.toUpperCase()} ROADMAP
          </span>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tight">
            Mi Dashboard
          </h1>
          <p className="text-slate-500 mt-2">Tu mapa de {weeks.length} semanas hacia el dominio del inglés.</p>
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-1 h-6 rounded-full ${isLevelFinished ? "bg-sky-500" : "bg-blue-600"}`} />
            <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">
                {isLevelFinished ? "¡Logro Desbloqueado!" : "Ejercicios Sugeridos"}
            </h2>
          </div>

          {currentLesson && (
            <div className={`rounded-[2.5rem] p-8 border transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm
              ${isLevelFinished 
                ? "bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#0c4a6e] border-sky-800 shadow-sky-200/50" 
                : "bg-white border-slate-100 shadow-sm"}`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
                  ${isLevelFinished ? "bg-white/10 text-white" : "bg-blue-50 text-blue-600"}`}>
                  {isLevelFinished ? <Trophy size={32} /> : <PlayCircle size={32} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isLevelFinished ? "text-sky-200" : "text-blue-500"}`}>
                        {isLevelFinished ? `NIVEL ${currentLevel.toUpperCase()} COMPLETADO` : `Semana ${currentLesson.week} • En curso`}
                    </span>
                  </div>
                  <h3 className={`text-2xl font-black ${isLevelFinished ? "text-white" : "text-[#0F172A]"}`}>
                    {isLevelFinished ? "¡Felicidades, eres un experto!" : currentLesson.title}
                  </h3>
                  <p className={`text-sm ${isLevelFinished ? "text-sky-100" : "text-slate-400"}`}>
                    {isLevelFinished ? "Has dominado todos los contenidos de este nivel." : "Tienes ejercicios pendientes en este módulo."}
                  </p>
                </div>
              </div>
              
              {!isLevelFinished ? (
                <button 
                  onClick={() => navigate(`/exercise/${currentLevel}/${currentLesson.week}/0`)}
                  className="bg-[#0F172A] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-all uppercase text-xs tracking-widest group"
                >
                  Continuar Lecciones
                  <PlayCircle size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-2xl text-white font-black text-xs uppercase tracking-tighter">
                    <Zap size={16} className="inline mr-2 text-yellow-300"/>
                    Nivel Mastered
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm mb-12">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Puntos Acumulados</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">{totalPoints.toFixed(1)}</span>
                        <span className="text-slate-300 font-bold text-xl">/ {MAX_POINTS}</span>
                    </div>
                </div>
                <span className={`text-3xl font-black ${isLevelFinished ? "text-sky-600" : "text-[#4ade80]"}`}>
                    {globalPercentage}%
                </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${globalPercentage}%` }}
                    className={`h-full rounded-full ${isLevelFinished ? "bg-gradient-to-r from-sky-400 to-sky-700" : "bg-gradient-to-r from-blue-500 to-indigo-600"}`}
                />
            </div>
        </div>

        <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 bg-blue-600 rounded-full" />
            <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Tu progreso por semana</h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {weeks.map((week) => {
            const isDone = week.progress === 100;
            return (
              <motion.div
                key={week.week}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/exercise/${currentLevel}/${week.week}/0`)}
                className={`group flex flex-col rounded-[2rem] border p-8 transition-all cursor-pointer min-h-[180px]
                  ${isDone 
                    ? "bg-gradient-to-br from-[#4ade80] to-[#16a34a] border-transparent hover:border-green-800 shadow-lg shadow-green-200/50" 
                    : "bg-white border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10"
                  }`}
              >
                <div className="flex flex-col flex-grow">
                  <div className="mb-4 flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg transition-colors
                      ${isDone 
                        ? "bg-white/20 text-white" 
                        : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"}`}>
                      {isDone ? <Check size={14} strokeWidth={4} /> : <BookOpen size={14} />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDone ? "text-white/80" : "text-blue-400"}`}>
                      WEEK {week.week.toString().padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className={`mb-6 text-lg font-bold leading-tight transition-colors
                    ${isDone ? "text-white" : "text-slate-900 group-hover:text-blue-600"}`}>
                    {week.title}
                  </h3>

                  <div className="mt-auto pt-4">
                    <div className="flex justify-between mb-2">
                      <span className={`text-[9px] font-black uppercase ${isDone ? "text-white/70" : "text-slate-400"}`}>
                        {isDone ? "¡Completado!" : "Progreso"}
                      </span>
                      <span className={`text-[9px] font-black ${isDone ? "text-white" : "text-slate-500"}`}>
                        {week.progress}%
                      </span>
                    </div>
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDone ? "bg-black/10" : "bg-slate-100"}`}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${week.progress}%` }}
                        className={`h-full ${isDone ? "bg-white" : "bg-blue-600"}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;