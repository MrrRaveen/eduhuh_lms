import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Megaphone, Calendar,
  FolderOpen, LogOut, GraduationCap
} from 'lucide-react';

export default function Layout({ children, role }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate('/');
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const teacherNav = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/teacher' },
    { icon: BookOpen, label: 'Gradebook', to: '/teacher/gradebook' },
    { icon: Megaphone, label: 'Announcements', to: '/teacher/announcements' },
    { icon: FolderOpen, label: 'Resources', to: '/teacher/resources' },
  ];
  const studentNav = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/student' },
    { icon: Calendar, label: 'Timetable', to: '/student/timetable' },
    { icon: BookOpen, label: 'My Marks', to: '/student/marks' },
    { icon: Megaphone, label: 'Announcements', to: '/student/announcements' },
  ];
  const nav = role === 'teacher' ? teacherNav : studentNav;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">EduHub</span>
        </div>
        <nav className="flex-1 space-y-1">
          {nav.map(item => (
            <button key={item.to} onClick={() => navigate(item.to)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition text-sm font-medium">
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-sm font-medium">
            <LogOut className="w-4 h-4"/> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}