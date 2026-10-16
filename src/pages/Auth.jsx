import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';
import { GraduationCap, LogIn, UserPlus, Sparkles } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast('Welcome back!');
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, role } }
        });
        if (error) throw error;
        toast('Account created! Please sign in.');
        setIsLogin(true);
      }
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (r) => {
    setLoading(true);
    // NOTE: Create these accounts in Supabase Auth manually for the demo
    const creds = r === 'teacher'
      ? { email: 'demo-teacher@school.edu', password: 'Demo@1234' }
      : { email: 'demo-student@school.edu', password: 'Demo@1234' };
    const { error } = await supabase.auth.signInWithPassword(creds);
    if (error) toast('Demo account not seeded yet — see README', 'error');
    else toast(`Logged in as ${r}`);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">EduHub LMS</h1>
            <p className="text-sm text-gray-500">Grade 12 ICT & Math Exhibition</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${isLogin ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}>
            Sign In
          </button>
          <button onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${!isLogin ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}>
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input required value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              <div className="grid grid-cols-2 gap-2">
                {['student','teacher'].map(r => (
                  <button type="button" key={r} onClick={() => setRole(r)}
                    className={`py-2 rounded-xl border-2 font-medium capitalize transition ${
                      role === r ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'
                    }`}>{r}</button>
                ))}
              </div>
            </>
          )}
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <button disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
            {isLogin ? <><LogIn className="w-4 h-4"/> Sign In</> : <><UserPlus className="w-4 h-4"/> Create Account</>}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
            <Sparkles className="w-3 h-3"/> One-Click Exhibition Demo
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => demoLogin('teacher')}
              className="py-2 rounded-xl border-2 border-indigo-200 text-indigo-700 font-medium text-sm hover:bg-indigo-50">
              👩‍🏫 Demo Teacher
            </button>
            <button onClick={() => demoLogin('student')}
              className="py-2 rounded-xl border-2 border-purple-200 text-purple-700 font-medium text-sm hover:bg-purple-50">
              👨‍🎓 Demo Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
