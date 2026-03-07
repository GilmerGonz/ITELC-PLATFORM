import React, { useEffect, useState } from "react";
import { 
  Users, GraduationCap, Clock, LayoutDashboard, 
  LogOut, AlertCircle, RefreshCw, Plus, X, ShieldCheck 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ITELCLogo from "../components/ITELCLogo";
import { supabase } from "../lib/supabase";
import { supabaseAdmin } from "../lib/supabaseAdmin";

// Aplicación de tipografía Montserrat/Poppins
const dashboardStyle = { fontFamily: "'Poppins', 'Montserrat', sans-serif" };

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
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
        // Estudiantes
        setStudents(profiles.filter(p => ['student', 'estudiante', 'alumno'].includes((p.role || "").toLowerCase().trim())));
        
        // FILTRO ESPECIAL:
        // Mantenemos "Prof. Gilmer Gonzalez" pero quitamos al administrador "gilmergonzalez@adminitelc.com"
        setTeachers(profiles.filter(p => {
          const role = (p.role || "").toLowerCase().trim();
          const email = (p.email || "").toLowerCase().trim();
          const name = (p.full_name || "").toLowerCase().trim();

          const isTeacherRole = ['teacher', 'profesor', 'docente', 'admin'].includes(role);
          const isAdminAccount = email === 'gilmergonzalez@adminitelc.com'; // Este es el que se quita
          
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
        user_metadata: { 
          full_name: formData.full_name,
          role: formData.role 
        }
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
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-900" style={dashboardStyle}>
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-8 sticky top-0 h-screen">
        <div className="mb-10"><ITELCLogo size="md" /></div>
        <nav className="space-y-2 flex-1">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4">Administración</div>
          <button className="flex items-center gap-4 w-full p-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-transform active:scale-95">
            <LayoutDashboard size={18} /> Panel de Control
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-4 w-full p-4 text-red-500 hover:bg-red-50 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-auto transition-colors border border-transparent hover:border-red-100">
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">Monitor ITELC</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Seguimiento de Alumnos (Puntaje Total: 60ptos)</p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 border-b-4 border-blue-800"
             >
               <Plus size={16} /> Crear Usuario
             </button>
             <button onClick={fetchData} className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-blue-600">
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
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-600 rounded-2xl text-white"><GraduationCap size={20} /></div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Cuerpo Docente</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map((t) => (
                  <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-blue-400 transition-colors">
                    <p className="font-black text-slate-900 mb-3 truncate">{t.full_name || t.email}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase">
                      <Clock size={12}/> Visto: {formatLastSeen(t.last_sign_in)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-slate-900 rounded-2xl text-white"><Users size={20} /></div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Progreso Académico</h2>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden">
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
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{s.email}</p>
                          </td>
                          <td className="p-8 text-center">
                            <span className="bg-blue-600 text-white px-4 py-2 rounded-full font-black text-xs">
                              {puntos} / 60
                            </span>
                          </td>
                          <td className="p-8">
                            <div className="h-3 w-40 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${porcentaje}%` }} 
                                className={`h-full ${porcentaje === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                              />
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
            </section>
          </AnimatePresence>
        )}
      </main>

      {/* MODAL DE REGISTRO */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6" style={dashboardStyle}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[3rem] p-10 border border-slate-200 relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><ShieldCheck size={24}/></div>
                <h2 className="text-2xl font-black tracking-tighter">Registrar Nuevo</h2>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <input required type="text" placeholder="Nombre Completo" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-blue-500 outline-none transition-all text-sm"
                  value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                
                <input required type="email" placeholder="Email del Usuario" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-blue-500 outline-none transition-all text-sm"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                
                <input required type="password" placeholder="Contraseña (Mín. 6)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-blue-500 outline-none transition-all text-sm"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Asignar Rol</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-sm appearance-none cursor-pointer"
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="student">Estudiante</option>
                    <option value="teacher">Profesor</option>
                  </select>
                </div>

                {formData.role === 'student' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-blue-500 ml-2">Docente Encargado</label>
                    <select required className="w-full p-4 bg-blue-50 border border-blue-200 rounded-2xl font-bold outline-none text-blue-900 text-sm appearance-none cursor-pointer"
                      value={formData.teacher_id} onChange={e => setFormData({...formData, teacher_id: e.target.value})}>
                      <option value="">Selecciona al profesor...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.full_name || t.email}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button 
                  disabled={formLoading}
                  className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-6 hover:bg-blue-600 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {formLoading ? "Generando..." : "Finalizar Registro"}
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