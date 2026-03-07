import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase"; 

// IMPORTACIÓN DEL GUARDIÁN (Asegúrate que el archivo se llame exactamente así)
import ProtectedRoute from "./components/ProtectedRoute.tsx";

// IMPORTACIÓN DE PÁGINAS (He añadido .tsx para que Vercel no se pierda)
import Login from "./pages/Login.tsx";
import MyCourses from "./pages/MyCourses.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ExerciseModule from "./pages/ExerciseModule.tsx";
import Progress from "./pages/Progress.tsx";
import Tips from "./pages/Tips.tsx";
import NotFound from "./pages/NotFound.tsx";

// NUEVAS IMPORTACIONES (DOCENTE Y ADMIN)
import TeacherDashboard from "./pages/TeacherDashboard.tsx"; 
import AdminDashboard from "./pages/AdminDashboard.tsx";

const queryClient = new QueryClient();

const App = () => {
  // ==========================================
  // LÓGICA DE RASTREO DE ACTIVIDAD EN TIEMPO REAL
  // ==========================================
  useEffect(() => {
    const updateLastSeen = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Actualizamos la columna last_sign_in en la tabla profiles
        await supabase
          .from('profiles')
          .update({ 
            last_sign_in: new Date().toISOString() 
          })
          .eq('id', session.user.id);
      }
    };

    // Se ejecuta al cargar la app
    updateLastSeen();

    // Escucha cambios de autenticación (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) updateLastSeen();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirección inicial al Login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Rutas Protegidas bajo el Guardián */}
            <Route element={<ProtectedRoute />}>
              {/* ADMIN */}
              <Route path="/admin-dashboard" element={<AdminDashboard />} />

              {/* DOCENTE */}
              <Route path="/teacher-dashboard" element={<TeacherDashboard />} />

              {/* ESTUDIANTE */}
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/dashboard/:courseId" element={<Dashboard />} />
              <Route path="/dashboard" element={<Navigate to="/dashboard/a1" replace />} />
              <Route path="/exercise/:courseId/:weekId/:step" element={<ExerciseModule />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/tips" element={<Tips />} />
            </Route>

            {/* Error 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;