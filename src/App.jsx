import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Auth from './pages/Auth';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

export default function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) {
        const { data: p } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single();
        setRole(p?.role);
      }
      setLoading(false);
    });
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_, session) => {
      setSession(session);
      if (session) {
        const { data: p } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        setRole(p?.role);
      } else {
        setRole(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading LMS...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={session ? <Navigate to={role === 'teacher' ? '/teacher' : '/student'} /> : <Auth />} />
        <Route path="/teacher/*" element={session && role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/" />} />
        <Route path="/student/*" element={session && role === 'student' ? <StudentDashboard /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
