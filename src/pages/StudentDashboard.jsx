import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { Calendar, Award, Megaphone, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [marks, setMarks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) return;

      const [m, a, t] = await Promise.all([
        supabase.from('marks').select('*').eq('student_id', user.id),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('timetable').select('*').order('start_time'),
      ]);
      setMarks(m.data || []);
      setAnnouncements(a.data || []);
      setTimetable(t.data || []);
    })();
  }, []);

  const avg = marks.length
    ? Math.round(marks.reduce((s, m) => s + (m.score / m.max_score) * 100, 0) / marks.length)
    : 0;
  const passed = marks.filter(m => (m.score / m.max_score) >= 0.5).length;

  return (
    <Layout role="student">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back 👋</h1>
        <p className="text-gray-500 mt-1">Here's what's happening in your classes today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Award} label="Average" value={`${avg}%`} color="from-indigo-500 to-purple-500" />
        <StatCard icon={CheckCircle2} label="Subjects Passed" value={passed} color="from-emerald-500 to-teal-500" />
        <StatCard icon={XCircle} label="Needs Attention" value={marks.length - passed} color="from-rose-500 to-red-500" />
        <StatCard icon={TrendingUp} label="Total Marks" value={marks.length} color="from-amber-500 to-orange-500" />
      </div>

      {/* Timetable */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600"/> Weekly Timetable
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4">Time</th>
                {DAYS.map(d => <th key={d} className="py-2 px-2">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, slot) => {
                const slots = DAYS.map(day =>
                  timetable.filter(t => {
                    const idx = timetable.filter(x => x.day === day).findIndex(x => x.id === t.id);
                    return false;
                  })
                );
                // simpler: group by start_time
                return null;
              })}
              {/* Simplified rendering */}
              {groupTimes(timetable).map(time => (
                <tr key={time} className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-700 whitespace-nowrap">{time}</td>
                  {DAYS.map(day => {
                    const cls = timetable.find(t => t.day === day && t.start_time === time);
                    return (
                      <td key={day} className="py-2 px-2">
                        {cls ? (
                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-2">
                            <p className="font-semibold text-indigo-700 text-xs">{cls.subject}</p>
                            <p className="text-[10px] text-gray-500">{cls.teacher} • {cls.room}</p>
                          </div>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marks */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600"/> My Marks
          </h2>
          <div className="space-y-2">
            {marks.length === 0 && <p className="text-sm text-gray-400">No marks yet.</p>}
            {marks.map(m => {
              const pct = Math.round((m.score / m.max_score) * 100);
              const pass = pct >= 50;
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${pass ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    {pct}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{m.subject}</p>
                    <p className="text-xs text-gray-500">{m.term} • {m.score}/{m.max_score}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${pass ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {pass ? 'Pass' : 'Fail'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-600"/> Announcements
          </h2>
          <div className="space-y-3">
            {announcements.length === 0 && <p className="text-sm text-gray-400">No announcements.</p>}
            {announcements.map(a => (
              <div key={a.id} className={`p-4 rounded-xl border-l-4 ${
                a.priority === 'high' ? 'border-rose-500 bg-rose-50' :
                a.priority === 'low' ? 'border-gray-300 bg-gray-50' :
                'border-indigo-500 bg-indigo-50'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900 text-sm">{a.title}</p>
                  <span className="text-[10px] text-gray-500">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function groupTimes(timetable) {
  return Array.from(new Set(timetable.map(t => t.start_time))).sort();
}
