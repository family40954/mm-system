
import React, { useState } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Printer, 
  X, AlertCircle, UserPlus, Settings2, CheckCircle2, GraduationCap
} from 'lucide-react';
import { Student, MadrasaProfile } from '../types';

interface LearnersProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  classes: string[];
  setClasses: React.Dispatch<React.SetStateAction<string[]>>;
  sessions: string[];
  setSessions: React.Dispatch<React.SetStateAction<string[]>>;
  profile: MadrasaProfile;
}

const Learners: React.FC<LearnersProps> = ({ students, setStudents, classes, setClasses, sessions, setSessions, profile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('সব');
  const [filterSession, setFilterSession] = useState('সব');

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentStudent, setCurrentStudent] = useState<Partial<Student> | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [manageType, setManageType] = useState<'class' | 'session'>('class');

  const toBn = (input: string | number | undefined | null) => {
    if (input === undefined || input === null || input === '') return '';
    const digits: Record<string, string> = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return String(input).replace(/[0-9]/g, w => digits[w]);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.includes(searchTerm) || s.id.includes(searchTerm);
    const matchesClass = filterClass === 'সব' || s.class === filterClass;
    const matchesSession = filterSession === 'সব' || s.session === filterSession;
    return matchesSearch && matchesClass && matchesSession;
  });

  const openAddModal = () => {
    setCurrentStudent({
      id: `S${Date.now().toString().slice(-6)}`,
      name: '',
      fatherName: '',
      class: classes[0] || 'কায়দা',
      roll: 1,
      phone: '',
      status: 'active',
      address: '',
      session: sessions[sessions.length - 1] || '২০২৪-২৫'
    });
    setIsStudentModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setCurrentStudent(student);
    setIsStudentModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (studentToDelete) {
      setStudents(students.filter(s => s.id !== studentToDelete));
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  const saveStudent = () => {
    if (!currentStudent?.name) return;
    if (students.find(s => s.id === currentStudent.id)) {
      setStudents(students.map(s => s.id === currentStudent.id ? (currentStudent as Student) : s));
    } else {
      setStudents([...students, currentStudent as Student]);
    }
    setIsStudentModalOpen(false);
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    if (manageType === 'class') {
      if (!classes.includes(newItemName)) setClasses([...classes, newItemName]);
    } else {
      if (!sessions.includes(newItemName)) setSessions([...sessions, newItemName]);
    }
    setNewItemName('');
  };

  const removeItem = (item: string) => {
    if (manageType === 'class') {
      setClasses(classes.filter(c => c !== item));
    } else {
      setSessions(sessions.filter(s => s !== item));
    }
  };

  const MadrasaHeader = ({ title }: { title: string }) => (
    <div className="text-center mb-8 border-b-4 border-double border-slate-900 pb-6">
      <div className="flex justify-center items-center gap-6">
        {profile?.logo ? (
          <img src={profile.logo} className="w-16 h-16 object-contain" alt="Logo" />
        ) : (
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white"><GraduationCap size={32} /></div>
        )}
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 leading-tight">{profile?.name}</h1>
          <p className="text-xs font-bold text-slate-600 leading-tight">{profile?.address}</p>
          <p className="text-[10px] font-bold text-slate-500 leading-tight">মোবাইল: {toBn(profile?.phone)}</p>
        </div>
      </div>
      <div className="mt-4 inline-block bg-slate-900 text-white px-8 py-1 rounded-full font-bold text-md tracking-wider">
        {title}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 no-print">
        <div className="flex-1 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="নাম বা আইডি দিয়ে খুঁজুন..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-madrasa-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 outline-none">
              <option value="সব">সকল জামাত</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterSession} onChange={(e) => setFilterSession(e.target.value)} className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 outline-none">
              <option value="সব">সকল সেশন</option>
              {sessions.map(s => <option key={s} value={s}>{toBn(s)}</option>)}
            </select>
            <button 
              onClick={() => setIsManageModalOpen(true)}
              className="p-3 text-madrasa-600 bg-madrasa-50 rounded-2xl hover:bg-madrasa-100 transition-all border border-madrasa-100 shadow-sm"
              title="জামাত ও সেশন ম্যানেজ করুন"
            >
              <Settings2 size={20} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="px-6 py-3 text-slate-600 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all font-bold flex items-center gap-2"><Printer size={20} /> তালিকা প্রিন্ট</button>
          <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-3 text-white bg-madrasa-700 rounded-2xl hover:bg-madrasa-800 transition-all font-bold shadow-lg shadow-madrasa-700/20"><UserPlus size={18} /> নতুন শিক্ষার্থী</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden printable-area">
        <div className="hidden print:block p-8">
           <MadrasaHeader title={`শিক্ষার্থী তালিকা - ${filterClass === 'সব' ? 'সকল জামাত' : filterClass} (${toBn(filterSession)})`} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-black">
                <th className="px-6 py-4 text-center font-black uppercase tracking-widest text-xs">রোল</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-xs">নাম ও আইডি</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-xs">পিতার নাম ও ফোন</th>
                <th className="px-6 py-4 text-center font-black uppercase tracking-widest text-xs">জামাত</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-xs">ঠিকানা ও সেশন</th>
                <th className="px-6 py-4 text-center no-print font-black uppercase tracking-widest text-xs">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b border-black">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-black text-center text-lg">{toBn(student.roll)}</td>
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-800">{student.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">ID: {toBn(student.id)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700">{student.fatherName}</div>
                    <div className="text-xs text-blue-600 font-bold">{toBn(student.phone)}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-center">
                    <div>{student.class}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold">
                    <div className="max-w-[200px] print:max-w-none">{student.address || 'ঠিকানা নেই'}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-tighter mt-1">{toBn(student.session)}</div>
                  </td>
                  <td className="px-6 py-4 text-center no-print">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(student)}
                        className="p-2 text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all shadow-sm"
                        title="ইডিট করুন"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(student.id)}
                        className="p-2 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-all shadow-sm"
                        title="ডিলিট করুন"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold">কোনো শিক্ষার্থী পাওয়া যায়নি।</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="hidden print:block pt-32 pb-10 grid grid-cols-2 gap-20 text-center">
            <div className="border-t-2 border-black pt-2 font-black">নাজেম-এ-তালীমাত</div>
            <div className="border-t-2 border-black pt-2 font-black">মুহতামীম / প্রিন্সিপাল</div>
        </div>
      </div>

      {/* Student Entry/Edit Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-8 bg-madrasa-900 text-white flex justify-between items-center">
              <h3 className="text-xl font-black">{students.find(s => s.id === currentStudent?.id) ? 'তথ্য সংশোধন' : 'নতুন শিক্ষার্থী'}</h3>
              <button onClick={() => setIsStudentModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="শিক্ষার্থীর নাম" value={currentStudent?.name || ''} onChange={(e) => setCurrentStudent({...currentStudent, name: e.target.value})} className="px-6 py-4 bg-slate-50 border rounded-2xl font-bold" />
                <input type="text" placeholder="পিতার নাম" value={currentStudent?.fatherName || ''} onChange={(e) => setCurrentStudent({...currentStudent, fatherName: e.target.value})} className="px-6 py-4 bg-slate-50 border rounded-2xl font-bold" />
                <select value={currentStudent?.class} onChange={(e) => setCurrentStudent({...currentStudent, class: e.target.value})} className="px-6 py-4 bg-slate-50 border rounded-2xl font-bold">
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="রোল" value={currentStudent?.roll || ''} onChange={(e) => setCurrentStudent({...currentStudent, roll: parseInt(e.target.value) || 0})} className="px-6 py-4 bg-slate-50 border rounded-2xl font-bold" />
                <input type="text" placeholder="ফোন" value={currentStudent?.phone || ''} onChange={(e) => setCurrentStudent({...currentStudent, phone: e.target.value})} className="px-6 py-4 bg-slate-50 border rounded-2xl font-bold" />
                <select value={currentStudent?.session} onChange={(e) => setCurrentStudent({...currentStudent, session: e.target.value})} className="px-6 py-4 bg-slate-50 border rounded-2xl font-bold">
                  {sessions.map(s => <option key={s} value={s}>{toBn(s)}</option>)}
                </select>
              </div>
              <textarea placeholder="ঠিকানা" value={currentStudent?.address || ''} onChange={(e) => setCurrentStudent({...currentStudent, address: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold" rows={2} />
            </div>
            <div className="p-8 border-t flex justify-end gap-4 bg-slate-50">
              <button onClick={() => setIsStudentModalOpen(false)} className="px-8 py-3 text-slate-600 font-bold rounded-2xl hover:bg-slate-200">বাতিল</button>
              <button onClick={saveStudent} className="px-12 py-3 bg-madrasa-700 text-white font-black rounded-2xl hover:bg-madrasa-800 shadow-xl flex items-center gap-2">
                <CheckCircle2 size={18} /> সেভ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLY RESTORED: Manage Classes/Sessions Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
               <h3 className="text-xl font-black">জামাত ও সেশন ম্যানেজমেন্ট</h3>
               <button onClick={() => setIsManageModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl"><X size={24} /></button>
             </div>
             <div className="p-8">
                <div className="flex bg-slate-100 p-1.5 rounded-[24px] mb-8">
                   <button onClick={() => setManageType('class')} className={`flex-1 py-3.5 font-bold rounded-2xl transition-all ${manageType === 'class' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>জামাতসমূহ</button>
                   <button onClick={() => setManageType('session')} className={`flex-1 py-3.5 font-bold rounded-2xl transition-all ${manageType === 'session' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>সেশনসমূহ</button>
                </div>
                <div className="flex gap-3 mb-8">
                   <input type="text" placeholder={manageType === 'class' ? "নতুন জামাতের নাম..." : "নতুন সেশন (উদা: ২০২৫-২৬)"} value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="flex-1 px-5 py-3.5 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-madrasa-500" onKeyPress={(e) => e.key === 'Enter' && addItem()} />
                   <button onClick={addItem} className="px-6 bg-madrasa-700 text-white rounded-2xl font-bold hover:bg-madrasa-800 transition-all"><Plus size={24} /></button>
                </div>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
                   {(manageType === 'class' ? classes : sessions).map(item => (
                     <div key={item} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 group transition-all">
                        <span className="font-bold text-slate-800 text-lg">{manageType === 'session' ? toBn(item) : item}</span>
                        <button onClick={() => removeItem(item)} className="p-2 text-red-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 bg-red-50 rounded-xl" title="ডিলিট করুন"><Trash2 size={20} /></button>
                     </div>
                   ))}
                   {(manageType === 'class' ? classes : sessions).length === 0 && (
                     <p className="text-center py-10 text-slate-400 font-bold italic">কোনো তথ্য যোগ করা নেই।</p>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">শিক্ষার্থী ডিলিট?</h3>
            <p className="text-slate-500 text-sm mb-8">আপনি কি নিশ্চিত যে এই শিক্ষার্থীর তথ্য মুছে ফেলতে চান? ডিলিট করলে তা আর ফিরে পাওয়া যাবে না।</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-2xl hover:bg-slate-200">বাতিল</button>
              <button onClick={handleDelete} className="flex-1 py-3 text-white font-bold bg-red-500 rounded-2xl hover:bg-red-600 shadow-lg shadow-red-200">হ্যাঁ, ডিলিট</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Learners;
