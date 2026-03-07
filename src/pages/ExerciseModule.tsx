import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Importación de datos
import { levelA1Data } from "../data/levelA1";
import { levelA2Data } from "../data/levelA2";
import { levelB1Data } from "../data/levelB1"; // <--- 1. Importado con éxito

interface Exercise {
  type: "multiple-choice";
  question: string;
  options?: string[];
  correctAnswer: string;
  theoryPill?: string;
}

interface WeekContent {
  title: string;
  exercises: Exercise[];
}

const ExerciseModule: React.FC = () => {
  const { courseId, weekId } = useParams<{ courseId: string; weekId: string }>();
  const navigate = useNavigate();
  
  // 2. Mapeo dinámico de datos para evitar ifs manuales
  const dataMap: Record<string, Record<number, WeekContent>> = {
    a1: levelA1Data as Record<number, WeekContent>,
    a2: levelA2Data as Record<number, WeekContent>,
    b1: levelB1Data as Record<number, WeekContent>, // <--- Ahora b1 es parte del sistema
  };

  const levelKey = (courseId || "a1").toLowerCase();
  const currentLevelData = dataMap[levelKey] || dataMap.a1;
  const weekNum = parseInt(weekId || "1", 10);
  const currentWeek = currentLevelData[weekNum];

  const [currentEx, setCurrentEx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedAnswer("");
    setFeedback(null);
  }, [currentEx]);

  if (!currentWeek) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
        <h2 className="text-xl font-bold mb-4 text-red-500">Contenido no encontrado</h2>
        <Button onClick={() => navigate("/my-courses")}>Volver al inicio</Button>
      </div>
    );
  }

  const exercise = currentWeek.exercises[currentEx];
  const totalExercises = currentWeek.exercises.length;

  const handleVerify = () => {
    if (selectedAnswer === exercise.correctAnswer) {
      setFeedback("correct");
      setCorrectCount(prev => prev + 1);
    } else {
      setFeedback("incorrect");
    }
  };

  const handleNext = async () => {
    if (currentEx < totalExercises - 1) {
      setCurrentEx(prev => prev + 1);
    } else {
      setIsSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Puntos proporcionales (Max 5 por semana)
          const points = parseFloat((correctCount * (5 / totalExercises)).toFixed(2));
          
          const { error } = await supabase.from('user_progress').upsert({
            user_id: user.id,
            lesson_id: weekNum,
            level: levelKey, // <--- Guardamos el nivel correcto (a1, a2 o b1)
            completed_count: correctCount,
            points: points,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'user_id,lesson_id,level' 
          });

          if (error) throw error;
        }
        toast.success("¡Lección completada!");
        navigate(`/dashboard/${levelKey}`);
      } catch (e) {
        console.error(e);
        toast.error("Error al guardar progreso");
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10 font-sans">
      {/* Header de Progreso */}
      <div className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-10 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2" size={16} /> Salir
          </button>
          <div className="flex-1 max-w-xs mx-4 text-center">
            <span className="block text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">
              {levelKey.toUpperCase()} • SEMANA {weekNum}
            </span>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-blue-500 transition-all duration-500" 
                 style={{ width: `${((currentEx + 1) / totalExercises) * 100}%` }}
               />
            </div>
          </div>
          <span className="text-sm font-black text-slate-400 w-10 text-right">{currentEx + 1}/{totalExercises}</span>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-4 pt-10">
        <div key={currentEx} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {exercise.theoryPill && !feedback && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-900 flex gap-3 shadow-sm">
              <BookOpen className="shrink-0 text-blue-600" size={20} />
              <p className="font-medium">{exercise.theoryPill}</p>
            </div>
          )}

          <h3 className="text-2xl font-black text-slate-800 text-center mb-10 leading-tight">
            {exercise.question}
          </h3>

          {/* Opciones */}
          <div className="space-y-3">
            {exercise.options?.map((opt) => (
              <button
                key={opt}
                disabled={!!feedback}
                onClick={() => setSelectedAnswer(opt)}
                className={`w-full p-5 text-left rounded-2xl border-2 font-bold transition-all ${
                  selectedAnswer === opt 
                    ? feedback === "correct" 
                      ? "border-green-500 bg-green-50 text-green-700" 
                      : feedback === "incorrect" 
                        ? "border-red-500 bg-red-50 text-red-700" 
                        : "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-100 hover:border-slate-200 text-slate-700 bg-white shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  {opt}
                  {selectedAnswer === opt && feedback === "correct" && <CheckCircle2 className="text-green-500" />}
                  {selectedAnswer === opt && feedback === "incorrect" && <XCircle className="text-red-500" />}
                </div>
              </button>
            ))}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`mt-8 p-6 rounded-[2rem] flex flex-col gap-2 font-bold animate-in zoom-in-95 ${
              feedback === "correct" ? "bg-green-500 text-white shadow-lg" : "bg-red-500 text-white shadow-lg"
            }`}>
              <div className="flex items-center gap-2 text-lg">
                {feedback === "correct" ? <CheckCircle2 /> : <XCircle />}
                <span>{feedback === "correct" ? "¡Excelente trabajo!" : "Respuesta incorrecta"}</span>
              </div>
              {feedback === "incorrect" && (
                <p className="text-sm font-medium opacity-90 border-t border-white/20 pt-2 mt-1">
                  La respuesta era: <span className="underline">{exercise.correctAnswer}</span>
                </p>
              )}
            </div>
          )}

          {/* Botonera */}
          <div className="mt-10">
            {!feedback ? (
              <Button 
                className="w-full py-8 text-xl font-black rounded-2xl shadow-xl transition-all active:scale-95 bg-slate-900" 
                onClick={handleVerify} 
                disabled={!selectedAnswer}
              >
                Verificar
              </Button>
            ) : (
              <Button 
                className={`w-full py-8 text-xl font-black rounded-2xl shadow-xl transition-all active:scale-95 ${
                  feedback === "correct" ? "bg-green-600 hover:bg-green-700" : "bg-slate-800 hover:bg-slate-900"
                }`} 
                onClick={handleNext}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="animate-spin" /> : currentEx < totalExercises - 1 ? "Siguiente" : "Finalizar"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExerciseModule;