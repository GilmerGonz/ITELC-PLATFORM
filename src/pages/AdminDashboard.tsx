import React, { useEffect, useState } from "react";
import { 
  Users, GraduationCap, Clock, LayoutDashboard, 
  LogOut, AlertCircle, RefreshCw, Plus, X, ShieldCheck, Menu 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ITELCLogo from "../components/ITELCLogo";
import { supabase } from "../lib/supabase";
import { supabaseAdmin } from "../lib/supabaseAdmin";

const dashboardStyle = { fontFamily: "'Poppins', 'Montserrat', sans-serif" };

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{count: number, error: any}>({count: 0, error: null});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student',
    teacher_id: ''
  });

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async () => {
    try {
      const { data: profiles, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('last_sign_in', { ascending: false });

      if (error) throw error;
      setDebugInfo({ count: count || 0, error: null });

      if (profiles) {
        setStudents(profiles.filter(p => ['student', 'estudiante', 'alumno'].includes((p.role || "").toLowerCase().trim())));
        setTeachers(profiles.filter(p => {
          const role = (p.role || "").toLowerCase().trim();
          const email = (p.email || "").toLowerCase().trim();
          const isTeacherRole = ['teacher', 'profesor', 'docente', 'admin'].includes(role);
          const isAdminAccount = email === 'gilmergonzalez@adminitelc.com';
          return isTeacherRole && !isAdminAccount;
        }));
      }
    } catch (err: any) {
      setDebugInfo(prev => ({ ...prev, error: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: { full_name: formData.full_name, role: formData.role }
      });
      if (authError) throw authError;
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
          teacher_id: formData.role === 'student' ? formData.teacher_id : null,
          current_points: 0
        }]);
      if (profileError) throw profileError;
      alert("🎉 Usuario registrado exitosamente");
      setIsModalOpen(false);
      setFormData({ email: '', password: '', full_name: '', role: 'student', teacher_id: '' });
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const formatLastSeen = (date: string) => {
    if (!date) return "NUNCA";
    return new Date(date).toLocaleString('es-ES', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
    }).toUpperCase();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row text-slate-900" style={dashboardStyle}>
      
      {/* Sidebar / Mobile Nav */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col p-8 transition-transform duration-300 lg:sticky lg:translate-x-0 lg:h-screen
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex items-center justify-between mb-10">
          <ITELCLogo size="md" />
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400"><X size={20}/></button>
        </div>
        <nav className="space-y-2 flex-1">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4">Administración</div>
          <button className="flex items-center gap-4 w-full p-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200">
            <LayoutDashboard size={18} /> Panel de Control
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-4 w-full p-4 text-red-500 hover:bg-red-50 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-auto border border-transparent hover:border-red-100 transition-all">
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden" />}

      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto w-full">
        {/* Mobile Header */}
        <div className="lg:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-50 rounded-xl text-slate-600"><Menu size={20}/></button>
          <ITELCLogo size="sm" />
          <button onClick={fetchData} className="p-2 text-blue-600"><RefreshCw size={18} className={loading ? "animate-spin" : ""} /></button>
        </div>

        <header className="mb-8 md:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900">Monitor ITELC</h1>
            <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-2">Seguimiento de Alumnos (Puntaje Total: 60ptos)</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <button 
               onClick={() => setIsModalOpen(true)}
               className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 border-b-4 border-blue-800 shadow-xl shadow-blue-100"
             >
               <Plus size={16} /> Crear Usuario
             </button>
             <button onClick={fetchData} className="hidden sm:block p-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all text-slate-400">
               <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
             </button>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col h-64 items-center justify-center gap-4 text-slate-400">
            <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="font-black text-[10px] uppercase tracking-[0.3em]">Sincronizando...</p>
          </div>
        ) : (
          <AnimatePresence>
            {/* Cuerpo Docente */}
            <section className="mb-12 md:mb-16">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100"><GraduationCap size={20} /></div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Cuerpo Docente</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {teachers.map((t) => (
                  <div key={t.id} className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-200 hover:border-blue-400 transition-all hover:shadow-xl hover:shadow-slate-100">
                    <p className="font-black text-slate-900 mb-2 md:mb-3 truncate">{t.full_name || t.email}</p>
                    <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-blue-600 uppercase">
                      <Clock size={12}/> Visto: {formatLastSeen(t.last_sign_in)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Progreso Estudiantes */}
            <section>
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-lg shadow-slate-200"><Users size={20} /></div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Progreso Académico</h2>
              </div>

              {/* Vista Desktop (Tabla) */}
              <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
                      <th className="p-8">Estudiante</th>
                      <th className="p-8 text-center">Puntaje</th>
                      <th className="p-8">Progreso</th>
                      <th className="p-8 text-right">Último Acceso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((s) => {
                      const puntos = Number(s.current_points || 0);
                      const porcentaje = Math.min((puntos / 60) * 100, 100);
                      return (
                        <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="p-8">
                            <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{s.full_name || "Alumno"}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mt-1">{s.email}</p>
                          </td>
                          <td className="p-8 text-center">
                            <span className="bg-blue-600 text-white px-4 py-2 rounded-full font-black text-xs shadow-md shadow-blue-100">
                              {puntos} / 60
                            </span>
                          </td>
                          <td className="p-8">
                            <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${porcentaje}%` }} className={`h-full ${porcentaje === 100 ? 'bg-green-500' : 'bg-blue-600'}`} />
                            </div>
                          </td>
                          <td className="p-8 text-right font-black text-[10px] text-slate-500 uppercase">
                            {formatLastSeen(s.last_sign_in)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Vista Móvil (Cards) */}
              <div className="md:hidden space-y-4">
                {students.map((s) => {
                  const puntos = Number(s.current_points || 0);
                  const porcentaje = Math.min((puntos / 60) * 100, 100);
                  return (
                    <div key={s.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 truncate">{s.full_name || "Alumno"}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{s.email}</p>
                        </div>
                        <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl font-black text-[10px] whitespace-nowrap">
                          {puntos} pts
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                          <span>Progreso</span>
                          <span>{Math.round(porcentaje)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                          <div className={`h-full ${porcentaje === 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${porcentaje}%` }} />
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                         <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Último Acceso</span>
                         <span className="text-[9px] font-bold text-slate-500">{formatLastSeen(s.last_sign_in)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </AnimatePresence>
        )}
      </main>

      {/* MODAL DE REGISTRO RESPONSIVE */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6" style={dashboardStyle}>
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[3rem] p-8 md:p-10 border border-slate-200 relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-colors">
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><ShieldCheck size={24}/></div>
                <h2 className="text-2xl font-black tracking-tighter">Registrar Usuario</h2>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Datos Personales</label>
                  <input required type="text" placeholder="Nombre Completo" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-blue-500 outline-none text-sm transition-all"
                    value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                  <input required type="email" placeholder="Email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-blue-500 outline-none text-sm transition-all"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Seguridad</label>
                  <input required type="password" placeholder="Contraseña (Mín. 6)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-blue-500 outline-none text-sm transition-all"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Tipo de Acceso</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-sm cursor-pointer"
                      value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      <option value="student">Estudiante</option>
                      <option value="teacher">Profesor</option>
                    </select>
                  </div>

                  {formData.role === 'student' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase text-blue-500 ml-2">Asignar Docente</label>
                      <select required className="w-full p-4 bg-blue-50 border border-blue-200 rounded-2xl font-bold outline-none text-blue-900 text-sm cursor-pointer"
                        value={formData.teacher_id} onChange={e => setFormData({...formData, teacher_id: e.target.value})}>
                        <option value="">Seleccionar...</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.full_name || t.email}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <button 
                  disabled={formLoading}
                  className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-4 hover:bg-blue-600 transition-all disabled:opacity-50 shadow-xl shadow-slate-100"
                >
                  {formLoading ? "PROCESANDO..." : "FINALIZAR REGISTRO"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
