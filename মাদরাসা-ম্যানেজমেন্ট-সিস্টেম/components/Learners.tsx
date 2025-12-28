
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Printer, 
  X, AlertCircle, UserPlus, Settings2, CheckCircle2, GraduationCap,
  FilterX
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

  const toEn = (input: string | number | undefined | null) => {
    if (input === undefined || input === null || input === '') return '';
    const digits: Record<string, string> = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
    return String(input).replace(/[০-৯]/g, w => digits[w]);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const search = searchTerm.toLowerCase().trim();
      const searchEn = toEn(search);
      
      const nameMatch = s.name.toLowerCase().includes(search);
      const idMatch = s.id.toLowerCase().includes(search) || s.id.toLowerCase().includes(searchEn);
      const phoneMatch = s.phone.includes(search) || s.phone.includes(searchEn);
      
      const matchesSearch = !search || nameMatch || idMatch || phoneMatch;
      const matchesClass = filterClass === 'সব' || s.class === filterClass;
      const matchesSession = filterSession === 'সব' || s.session === filterSession;
      
      return matchesSearch && matchesClass && matchesSession;
    });
  }, [students, searchTerm, filterClass, filterSession]);

  const chunkedStudents = useMemo(() => {
    const size = 25;
    const chunks = [];
    for (let i = 0; i < filteredStudents.length; i += size) {
      chunks.push(filteredStudents.slice(i, i + size));
    }
    return chunks;
  }, [filteredStudents]);

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

  const resetFilters = () => {
    setSearchTerm('');
    setFilterClass('সব');
    setFilterSession('সব');
  };

  const MadrasaHeader = ({ title, pageNum, totalPages }: { title: string, pageNum: number, totalPages: number }) => (
    <div className="text-center mb-6 border-b-2 border-slate-900 pb-4">
      <div className="flex justify-center items-center gap-4">
        {profile?.logo && (
          <img src={profile.logo} className="w-14 h-14 object-contain" alt="Logo" />
        )}
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 leading-tight">{profile?.name}</h1>
          <p className="text-[11px] font-bold text-slate-600 leading-tight">{profile?.address}</p>
          <div className="mt-1 flex justify-center gap-4 text-[10px] font-bold text-slate-500">
             <span>সেশন: {toBn(filterSession === 'সব' ? sessions[sessions.length-1] : filterSession)}</span>
             <span>পৃষ্ঠা: {toBn(pageNum)} / {toBn(totalPages)}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex justify-center">
        <span className="bg-slate-900 text-white px-8 py-0.5 rounded-full font-bold text-[12px] tracking-widest uppercase">
          {title}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 portrait !important; }
          .portrait-table { width: 100% !important; border-collapse: collapse !important; }
          .portrait-table th, .portrait-table td { border: 1px solid #000 !important; padding: 4px !important; font-size: 10pt !important; text-align: center; }
          .portrait-table th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
        }
      ` }} />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 no-print">
        <div className="flex-1 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="নাম, আইডি বা ফোন দিয়ে খুঁজুন..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-madrasa-500 outline-none transition-all" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select 
              value={filterClass} 
              onChange={(e) => setFilterClass(e.target.value)} 
              className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-madrasa-500"
            >
              <option value="সব">সকল জামাত</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={filterSession} 
              onChange={(e) => setFilterSession(e.target.value)} 
              className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-madrasa-500"
            >
              <option value="সব">সকল সেশন</option>
              {sessions.map(s => <option key={s} value={s}>{toBn(s)}</option>)}
            </select>
            <button onClick={resetFilters} className="p-3 text-slate-400 hover:text-red-500 bg-slate-50 rounded-2xl border border-slate-100 transition-all"><FilterX size={20} /></button>
            <button onClick={() => setIsManageModalOpen(true)} className="p-3 text-madrasa-600 bg-madrasa-50 rounded-2xl hover:bg-madrasa-100 transition-all border border-madrasa-100"><Settings2 size={20} /></button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="px-6 py-3 text-slate-600 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all font-bold flex items-center gap-2 shadow-sm border"><Printer size={20} /> তালিকা প্রিন্ট</button>
          <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-3 text-white bg-madrasa-700 rounded-2xl hover:bg-madrasa-800 transition-all font-bold shadow-lg"><UserPlus size={18} /> নতুন শিক্ষার্থী</button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="px-6 py-4 text-center font-black text-slate-400 uppercase tracking-widest text-[10px]">রোল</th>
                <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">নাম ও আইডি</th>
                <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">পিতার নাম ও ফোন</th>
                <th className="px-6 py-4 text-center font-black text-slate-400 uppercase tracking-widest text-[10px]">জামাত</th>
                <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">ঠিকানা ও সেশন</th>
                <th className="px-6 py-4 text-center font-black text-slate-400 uppercase tracking-widest text-[10px]">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-black text-center text-lg text-slate-800">{toBn(student.roll)}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 leading-tight">{student.name} <span className="block text-[10px] text-slate-400">ID: {toBn(student.id)}</span></td>
                  <td className="px-6 py-4 font-bold text-slate-700">{student.fatherName} <span className="block text-xs text-blue-600 font-bold">{toEn(student.phone)}</span></td>
                  <td className="px-6 py-4 font-bold text-center text-slate-700">{student.class}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{student.address || 'ঠিকানা নেই'} <span className="block text-[10px] text-slate-400 mt-1">{toBn(student.session)}</span></td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(student)} className="p-2 text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100"><Edit2 size={16} /></button>
                      <button onClick={() => confirmDelete(student.id)} className="p-2 text-red-500 bg-red-50 rounded-xl hover:bg-red-100"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hidden print:block printable-area bg-white">
        {chunkedStudents.map((chunk, pageIdx) => (
          <div key={pageIdx} className="page-container p-[0.3in] bg-white flex flex-col" style={{ minHeight: '11.3in', pageBreakAfter: 'always' }}>
            <MadrasaHeader title={`শিক্ষার্থী তালিকা - ${filterClass === 'সব' ? 'সকল জামাত' : filterClass}`} pageNum={pageIdx + 1} totalPages={chunkedStudents.length} />
            <div className="flex-grow">
              <table className="portrait-table w-full border border-black">
                <thead>
                  <tr className="bg-slate-100">
                    <th style={{ width: '40px' }}>নং</th>
                    <th style={{ width: '50px' }}>রোল</th>
                    <th style={{ textAlign: 'left' }}>শিক্ষার্থীর নাম ও আইডি</th>
                    <th style={{ textAlign: 'left' }}>পিতার নাম</th>
                    <th style={{ width: '100px' }}>মোবাইল নম্বর</th>
                    <th style={{ width: '80px' }}>জামাত</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((student, idx) => (
                    <tr key={student.id}>
                      <td className="font-bold">{toBn(pageIdx * 25 + idx + 1)}</td>
                      <td className="font-bold">{toBn(student.roll)}</td>
                      <td className="text-left font-bold text-[11pt]">{student.name} <span className="block text-[8pt] text-slate-500 italic font-normal">ID: {toBn(student.id)}</span></td>
                      <td className="text-left font-medium">{student.fatherName}</td>
                      <td className="font-bold text-[9pt]">{toBn(student.phone)}</td>
                      <td className="font-bold">{student.class}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-12 flex justify-between items-end px-4 pt-10 pb-4">
               <div className="text-center w-52 border-t-2 border-black pt-1 font-black text-[11pt] text-slate-900 uppercase">নাজীমে তালীমাত</div>
               <div className="text-center w-52 border-t-2 border-black pt-1 font-black text-[11pt] text-slate-900 uppercase">মুহতামীম / প্রিন্সিপাল</div>
            </div>
          </div>
        ))}
      </div>

      {isStudentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="p-8 bg-madrasa-900 text-white flex justify-between items-center">
              <h3 className="text-xl font-black">{students.find(s => s.id === currentStudent?.id) ? 'তথ্য সংশোধন' : 'নতুন শিক্ষার্থী ভর্তি'}</h3>
              <button onClick={() => setIsStudentModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="শিক্ষার্থীর নাম" value={currentStudent?.name || ''} onChange={(e) => setCurrentStudent({...currentStudent, name: e.target.value})} className="w-full px-6 py-3.5 bg-slate-50 border rounded-2xl font-bold" />
                <input type="text" placeholder="পিতার নাম" value={currentStudent?.fatherName || ''} onChange={(e) => setCurrentStudent({...currentStudent, fatherName: e.target.value})} className="w-full px-6 py-3.5 bg-slate-50 border rounded-2xl font-bold" />
                <select value={currentStudent?.class} onChange={(e) => setCurrentStudent({...currentStudent, class: e.target.value})} className="w-full px-6 py-3.5 bg-slate-50 border rounded-2xl font-bold">
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="রোল নম্বর" value={currentStudent?.roll || ''} onChange={(e) => setCurrentStudent({...currentStudent, roll: parseInt(e.target.value) || 0})} className="w-full px-6 py-3.5 bg-slate-50 border rounded-2xl font-bold" />
                <input type="text" placeholder="ফোন নম্বর" value={currentStudent?.phone || ''} onChange={(e) => setCurrentStudent({...currentStudent, phone: e.target.value})} className="w-full px-6 py-3.5 bg-slate-50 border rounded-2xl font-bold" />
                <select value={currentStudent?.session} onChange={(e) => setCurrentStudent({...currentStudent, session: e.target.value})} className="w-full px-6 py-3.5 bg-slate-50 border rounded-2xl font-bold">
                  {sessions.map(s => <option key={s} value={s}>{toBn(s)}</option>)}
                </select>
              </div>
              <textarea placeholder="স্থায়ী ঠিকানা" value={currentStudent?.address || ''} onChange={(e) => setCurrentStudent({...currentStudent, address: e.target.value})} className="w-full px-6 py-3.5 bg-slate-50 border rounded-2xl font-bold" rows={2} />
            </div>
            <div className="p-8 border-t flex justify-end gap-4 bg-slate-50">
              <button onClick={() => setIsStudentModalOpen(false)} className="px-8 py-3 text-slate-600 font-bold rounded-2xl hover:bg-slate-200">বাতিল</button>
              <button onClick={saveStudent} className="px-12 py-3 bg-madrasa-700 text-white font-black rounded-2xl hover:bg-madrasa-800 shadow-xl flex items-center gap-2 transition-transform hover:scale-105">
                <CheckCircle2 size={18} /> তথ্য সেভ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {isManageModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 p-8">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">সিস্টেম কনফিগ</h3>
                <button onClick={() => setIsManageModalOpen(false)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"><X size={24} /></button>
             </div>
             <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                <button onClick={() => setManageType('class')} className={`flex-1 py-3 font-bold rounded-xl transition-all ${manageType === 'class' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>জামাত</button>
                <button onClick={() => setManageType('session')} className={`flex-1 py-3 font-bold rounded-xl transition-all ${manageType === 'session' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>সেশন</button>
             </div>
             <div className="flex gap-2 mb-6">
                <input type="text" placeholder="নতুন নাম..." value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="flex-1 px-4 py-3 bg-slate-50 border rounded-xl font-bold" />
                <button onClick={addItem} className="px-6 bg-madrasa-700 text-white rounded-xl font-bold hover:bg-madrasa-800 transition-all shadow-md"><Plus size={24} /></button>
             </div>
             <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {(manageType === 'class' ? classes : sessions).map(item => (
                  <div key={item} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group border hover:border-slate-200 transition-all">
                     <span className="font-bold text-slate-800 text-lg">{manageType === 'session' ? toBn(item) : item}</span>
                     <button onClick={() => removeItem(item)} className="p-2 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">তথ্য মুছে ফেলবেন?</h3>
            <p className="text-slate-500 text-sm mb-8 italic">এই শিক্ষার্থীর তথ্য ডিলিট করলে তা আর ফিরে পাওয়া যাবে না।</p>
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
