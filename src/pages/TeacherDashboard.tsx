import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, TrendingUp, Search, RefreshCw, GraduationCap,
  Calendar, Send, LogOut, MessageSquare, BookOpen, X, PlusCircle, Trash2, MoreVertical
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ITELCLogo from "../components/ITELCLogo";
import { toast } from "sonner";

const MAX_POINTS_PER_LEVEL = 60;

const AVAILABLE_COURSES = [
  { id: "eng_a1", name: "English A1", category: "Idiomas", color: "blue" },
  { id: "eng_a2", name: "English A2", category: "Idiomas", color: "blue" },
  { id: "eng_b1", name: "English B1", category: "Idiomas", color: "blue" },
  { id: "eng_b2", name: "English B2", category: "Idiomas", color: "blue" },
  { id: "eng_c1", name: "English C1", category: "Idiomas", color: "blue" },
  { id: "eng_c2", name: "English C2", category: "Idiomas", color: "blue" },
  { id: "chi_hsk1", name: "Chinese HSK 1", category: "Idiomas", color: "red" },
  { id: "ger_a1", name: "German A1", category: "Idiomas", color: "orange" },
  { id: "ita_a1", name: "Italian A1", category: "Idiomas", color: "green" },
  { id: "prog_alg", name: "Algoritmos", category: "Programación", color: "emerald" },
  { id: "prog_web", name: "Frontend", category: "Programación", color: "emerald" },
  { id: "prog_db", name: "Bases de Datos", category: "Programación", color: "emerald" },
  { id: "sci_calc", name: "Cálculo", category: "Ciencias", color: "violet" },
  { id: "sci_mec", name: "Mecánica", category: "Ciencias", color: "violet" },
  { id: "sci_chem", name: "Química", category: "Ciencias", color: "violet" },
];

const getCourseColorStyles = (color: string, isSelected: boolean) => {
  const variants: Record<string, string> = {
    blue: isSelected ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-50 hover:border-blue-200 text-slate-600",
    red: isSelected ? "border-red-600 bg-red-50 text-red-700" : "border-slate-50 hover:border-red-200 text-slate-600",
    orange: isSelected ? "border-orange-600 bg-orange-50 text-orange-700" : "border-slate-50 hover:border-orange-200 text-slate-600",
    green: isSelected ? "border-green-600 bg-green-50 text-green-700" : "border-slate-50 hover:border-green-200 text-slate-600",
    emerald: isSelected ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-50 hover:border-emerald-200 text-slate-600",
    violet: isSelected ? "border-violet-600 bg-violet-50 text-violet-700" : "border-slate-50 hover:border-emerald-200 text-slate-600",
  };
  return variants[color] || variants.blue;
};

interface CourseDetail { id: string; level: string; points: number; percentage: number; db_id?: string; }
interface Student { id: string; name: string; lastActivity: string; courseDetails: CourseDetail[]; }

const TeacherDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("Docente ITELC");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [assigningStudent, setAssigningStudent] = useState<Student | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const averageProgress = useMemo(() => {
    if (students.length === 0) return 0;
    const allPercentages = students.flatMap(s => s.courseDetails.map(c => c.percentage));
    return allPercentages.length === 0 ? 0 : Math.round(allPercentages.reduce((acc, p) => acc + p, 0) / allPercentages.length);
  }, [students]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      if (prof) setUserName(prof.full_name);
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, updated_at').eq('teacher_id', user.id).eq('role', 'student');
      const { data: progressData } = await supabase.from('user_progress').select('id, user_id, points, level, course_id');

      const formatted = (profiles || []).map((profile) => {
        const studentProgress = (progressData || []).filter(p => p.user_id === profile.id);
        const courseDetails = studentProgress.map(p => {
          const courseInfo = AVAILABLE_COURSES.find(c => c.id === p.course_id || c.name === p.level);
          return {
            db_id: p.id,
            id: p.course_id || courseInfo?.id || `unknown_${p.id}`,
            level: p.level || courseInfo?.name || "Curso",
            points: p.points || 0,
            percentage: Math.min(Math.round(((p.points || 0) / MAX_POINTS_PER_LEVEL) * 100), 100)
          };
        });
        return {
          id: profile.id,
          name: profile.full_name || "Estudiante ITELC",
          lastActivity: profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('es-ES') : "Sin actividad",
          courseDetails: courseDetails
        };
      });
      setStudents(formatted);
    } catch (error) { toast.error("Error al cargar datos"); } finally { setLoading(false); }
  };

  const handleRemoveCourse = async (studentId: string, courseDbId: string, courseName: string) => {
    if (!confirm(`¿Estás seguro de que quieres quitar el curso ${courseName}?`)) return;
    try {
      const { data, error } = await supabase.from('user_progress').delete().eq('id', courseDbId).select();
      if (error) throw error;
      setStudents(prev => prev.map(student => student.id === studentId ? { ...student, courseDetails: student.courseDetails.filter(c => c.db_id !== courseDbId) } : student));
      toast.success("Curso eliminado");
    } catch (error) { toast.error("Error al eliminar"); fetchData(); }
  };

  const handleAssignCourse = async () => {
    if (!assigningStudent || !selectedCourseId) return;
    const courseInfo = AVAILABLE_COURSES.find(c => c.id === selectedCourseId);
    try {
      setSending(true);
      const { error } = await supabase.from('user_progress').upsert({
        user_id: assigningStudent.id,
        course_id: selectedCourseId,
        level: courseInfo?.name || selectedCourseId,
        points: 0,
        is_unlocked: true,
        lesson_id: 'course_start',
        topic_id: 'initial',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, course_id' });
      if (error) throw error;
      toast.success(`Acceso concedido`);
      setAssigningStudent(null);
      setSelectedCourseId("");
      fetchData(); 
    } catch (error: any) { toast.error("Error al desbloquear"); } finally { setSending(false); }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedStudent) return;
    try {
      setSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('messages').insert({
        sender_id: user?.id, receiver_id: selectedStudent.id,
        content: messageText, is_read: false, created_at: new Date().toISOString()
      });
      if (error) throw error;
      toast.success(`Mensaje enviado`);
      setMessageText("");
      setSelectedStudent(null);
    } catch (error) { toast.error("Error al enviar"); } finally { setSending(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-10">
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-black">Enviar Mensaje</h3>
                <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
              </div>
              <textarea 
                value={messageText} 
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Escribe un mensaje para el estudiante..."
                className="w-full h-32 md:h-40 p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none mb-6 resize-none text-sm"
              />
              <button onClick={handleSendMessage} disabled={sending} className="w-full py-4 rounded-2xl text-[11px] font-black uppercase bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                {sending ? "ENVIANDO..." : "ENVIAR MENSAJE"}
              </button>
            </motion.div>
          </div>
        )}

        {assigningStudent && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 md:p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-2 z-10">
                <div>
                  <h3 className="text-xl font-black">Desbloquear Curso</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase">{assigningStudent.name}</p>
                </div>
                <button onClick={() => setAssigningStudent(null)} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
              </div>
              
              <div className="space-y-8">
                {["Idiomas", "Programación", "Ciencias"].map(cat => (
                  <div key={cat} className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-1">{cat}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {AVAILABLE_COURSES.filter(c => c.category === cat).map(course => (
                        <button 
                          key={course.id} 
                          onClick={() => setSelectedCourseId(course.id)}
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${getCourseColorStyles(course.color, selectedCourseId === course.id)}`}
                        >
                          <p className="text-[11px] font-black uppercase tracking-tight">{course.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleAssignCourse} 
                disabled={sending || !selectedCourseId} 
                className="w-full mt-8 py-5 rounded-2xl text-[11px] font-black uppercase bg-[#0F172A] text-white hover:opacity-90 transition-all disabled:opacity-30 shadow-xl"
              >
                {sending ? "PROCESANDO..." : "CONFIRMAR Y DESBLOQUEAR"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <ITELCLogo size="sm" />
          <div className="flex items-center gap-3 md:gap-6">
            <div className="text-right hidden xs:block">
              <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Docente</p>
              <p className="text-xs md:text-sm font-bold truncate max-w-[100px]">{userName}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 transition-all bg-slate-50 rounded-xl"><LogOut size={18} /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <header className="mb-8 md:mb-10 text-center md:text-left">
          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2 block">GESTIÓN ACADÉMICA</span>
          <h1 className="text-3xl md:text-4xl font-black text-[#0F172A]">Panel de <span className="text-blue-600">Control</span></h1>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <StatsCard title="Total Alumnos" value={students.length} icon={<Users size={20}/>} color="blue" />
          <StatsCard title="Promedio Gral" value={`${averageProgress}%`} icon={<TrendingUp size={20}/>} color="green" />
          <StatsCard title="Fecha" value={new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} icon={<Calendar size={20}/>} color="indigo" />
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-5 md:p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar estudiante..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 outline-none text-sm font-bold border border-transparent focus:border-blue-100 transition-all" 
              />
            </div>
            <button onClick={fetchData} className="flex items-center justify-center gap-3 px-6 py-4 bg-[#0F172A] text-white rounded-2xl text-[11px] font-black tracking-widest uppercase hover:opacity-90 transition-all">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> {loading ? "..." : "SINCRONIZAR"}
            </button>
          </div>

          {/* VISTA DE ESCRITORIO (TABLA) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50/30 text-left">
                  <th className="px-8 py-5">Estudiante</th>
                  <th className="px-8 py-5">Cursos Activos</th>
                  <th className="px-8 py-5 text-right">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-8 align-top w-1/4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><GraduationCap size={18} /></div>
                        <div className="min-w-0">
                          <p className="font-bold truncate">{student.name}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase">{student.lastActivity}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col gap-3 max-w-[300px] pl-6 border-l-2 border-dashed border-slate-200 ml-2">
                        {student.courseDetails.map((course, idx) => (
                          <div key={course.db_id || idx} className="relative bg-white border border-slate-100 p-3 rounded-2xl shadow-sm group/course">
                            <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-sm" />
                            <button onClick={() => handleRemoveCourse(student.id, course.db_id!, course.level)} className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover/course:opacity-100 transition-all hover:bg-red-600 hover:text-white"><X size={10} /></button>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[9px] font-black text-blue-600 uppercase">{course.level}</span>
                              <span className="text-[10px] font-black">{course.percentage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 transition-all" style={{ width: `${course.percentage}%` }} />
                            </div>
                          </div>
                        ))}
                        <button onClick={() => setAssigningStudent(student)} className="mt-2 flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase hover:text-blue-800 transition-all">
                          <PlusCircle size={14} /> Desbloquear curso
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right align-top">
                      <button onClick={() => setSelectedStudent(student)} className="px-4 py-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all border border-blue-100">
                        <MessageSquare size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VISTA MÓVIL (CARDS) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredStudents.map((student) => (
              <div key={student.id} className="p-5 flex flex-col gap-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><GraduationCap size={18} /></div>
                    <div>
                      <p className="font-bold text-sm">{student.name}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase">Activo: {student.lastActivity}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedStudent(student)} className="p-3 rounded-xl bg-blue-50 text-blue-600"><MessageSquare size={16} /></button>
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cursos Activos</p>
                  <div className="grid grid-cols-1 gap-2">
                    {student.courseDetails.map((course, idx) => (
                      <div key={course.db_id || idx} className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl relative">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-black text-blue-600 uppercase">{course.level}</span>
                          <button onClick={() => handleRemoveCourse(student.id, course.db_id!, course.level)} className="text-red-400 p-1"><Trash2 size={14}/></button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600" style={{ width: `${course.percentage}%` }} />
                          </div>
                          <span className="text-[10px] font-bold">{course.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setAssigningStudent(student)} 
                    className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-[10px] font-black text-slate-400 uppercase flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                  >
                    <PlusCircle size={14} /> Desbloquear Curso
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  const styles = { 
    blue: "bg-blue-600 text-white shadow-blue-200", 
    green: "bg-white text-slate-900 border-slate-100", 
    indigo: "bg-white text-slate-900 border-slate-100" 
  };
  const iconBg = color === 'blue' ? "bg-white/20" : "bg-slate-50";
  
  return (
    <div className={`p-5 md:p-6 rounded-[2rem] shadow-lg border transition-all hover:scale-[1.02] ${styles[color]}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${iconBg}`}>{icon}</div>
        <div>
          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${color === 'blue' ? 'text-blue-100' : 'text-slate-400'}`}>{title}</p>
          <p className="text-xl md:text-2xl font-black">{value}</p>
        </div>
      </div>
    </div>
  );
};

interface StatsCardProps { title: string; value: string | number; icon: React.ReactNode; color: "blue" | "green" | "indigo"; }

export default TeacherDashboard;
