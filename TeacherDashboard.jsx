import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';
import Layout from '../components/Layout';
import { Users, BookOpen, Megaphone, TrendingUp, Plus, Save } from 'lucide-react';

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [resources, setResources] = useState([]);

  // Gradebook form
  const [form, setForm] = useState({
    student_id: '', subject: '', score: '', max_score: '100', term: 'Term 1'
  });
  // Announcement form
  const [ann, setAnn] = useState({ title: '', body: '', priority: 'normal' });
  // Resource form
  const [res, setRes] = useState({ title: '', type: 'Lecture Notes', url: '', subject: '' });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [s, m, a, r] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'student'),
      supabase.from('marks').select('*, profiles(full_name)').eq('role', 'teacher'), // simplified
      supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('resources').select('*').order('created_at', { ascending: false }).limit(5),
    ]);
    setStudents(s.data || []);
    setMarks(m.data || []);
    setAnnouncements(a.data || []);
    setResources(r.data || []);
  };

  const saveMark = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('marks').insert({
      ...form,
      score: Number(form.score),
      max_score: Number(form.max_score),
      teacher_id: user.id,
    });
    if (error) toast(error.message, 'error');
    else { toast('Mark saved'); setForm({ student_id: '', subject: '', score: '', max_score: '100', term: 'Term 1' }); loadAll(); }
  };

  const saveAnnouncement = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('announcements').insert({ ...ann, teacher_id: user.id });
    if (error) toast(error.message, 'error');
    else { toast('Announcement posted'); setAnn({ title: '', body: '', priority: 'normal' }); loadAll(); }
  };

  const saveResource = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('resources').insert({ ...res, teacher_id: user.id });
    if (error) toast(error.message, 'error');
    else { toast('Resource added'); setRes({ title: '', type: 'Lecture Notes', url: '', subject: '' }); loadAll(); }
  };

  const stats = [
    { label: 'Students', value: students.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Marks Recorded', value: marks.length, icon: BookOpen, color: 'from-emerald-500 to-teal-500' },
    { label: 'Announcements', value: announcements.length, icon: Megaphone, color: 'from-purple-500 to-pink-500' },
    { label: 'Resources', value: resources.length, icon: TrendingUp, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <Layout role="teacher">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your class, grades, and resources.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gradebook */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600"/> Gradebook Entry
          </h2>
          <form onSubmit={saveMark} className="space-y-3">
            <select required value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
              <option value="">Select student...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
            <input required placeholder="Subject (e.g. Mathematics)" value={form.subject}
              onChange={e => setForm({...form, subject: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            <div className="grid grid-cols-3 gap-2">
              <input required type="number" placeholder="Score" value={form.score}
                onChange={e => setForm({...form, score: e.target.value})}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              <input required type="number" placeholder="Max" value={form.max_score}
                onChange={e => setForm({...form, max_score: e.target.value})}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              <select value={form.term} onChange={e => setForm({...form, term: e.target.value})}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm">
                <option>Term 1</option><option>Term 2</option><option>Term 3</option><option>Final</option>
              </select>
            </div>
            <button className="w-full py-2 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 flex items-center justify-center gap-2">
              <Save className="w-4 h-4"/> Save Mark
            </button>
          </form>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-600"/> Broadcast Announcement
          </h2>
          <form onSubmit={saveAnnouncement} className="space-y-3">
            <input required placeholder="Title" value={ann.title}
              onChange={e => setAnn({...ann, title: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            <textarea required placeholder="Message body..." rows="3" value={ann.body}
              onChange={e => setAnn({...ann, body: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            <select value={ann.priority} onChange={e => setAnn({...ann, priority: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
              <option value="low">Low Priority</option>
              <option value="normal">Normal</option>
              <option value="high">High Priority</option>
            </select>
            <button className="w-full py-2 rounded-lg bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4"/> Post Announcement
            </button>
          </form>
        </div>

        {/* Resources */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600"/> Add Resource
          </h2>
          <form onSubmit={saveResource} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input required placeholder="Title" value={res.title}
              onChange={e => setRes({...res, title: e.target.value})}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            <select value={res.type} onChange={e => setRes({...res, type: e.target.value})}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm">
              <option>Lecture Notes</option><option>Worksheet</option><option>Syllabus</option><option>Link</option>
            </select>
            <input required placeholder="URL" value={res.url}
              onChange={e => setRes({...res, url: e.target.value})}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            <button className="py-2 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4"/> Add
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}