import React, { useState, useMemo } from 'react';
import { 
  Search, Printer, Plus, X, Receipt, Save, Trash2, 
  Calendar, Edit2, AlertCircle, Check, GraduationCap,
  User, CreditCard, ChevronRight, FileText
} from 'lucide-react';
import { Fee, Student, MadrasaProfile } from '../types';

interface FeesProps {
  fees: Fee[];
  setFees: React.Dispatch<React.SetStateAction<Fee[]>>;
  students: Student[];
  profile: MadrasaProfile;
  classes: string[];
  sessions: string[];
}

const Fees: React.FC<FeesProps> = ({ fees, setFees, students, profile, classes, sessions }) => {
  const [activeTab, setActiveTab] = useState<'entry' | 'history' | 'reports' | 'receipt'>('entry');
  const [selectedFeeId, setSelectedFeeId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState<string | null>(null);
  
  // Filtering for Entry
  const [entrySession, setEntrySession] = useState(sessions[sessions.length - 1] || '');
  const [entryClass, setEntryClass] = useState(classes[0] || '');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  // New Fee Form State
  const [newFee, setNewFee] = useState<Partial<Fee>>({
    type: 'মাসিক ফি',
    month: 'জানুয়ারি',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    receivedBy: 'অফিস সহকারী'
  });

  const [reportClass, setReportClass] = useState('All');
  const [reportSession, setReportSession] = useState(sessions[sessions.length - 1] || '');

  const toBn = (input: string | number | undefined | null) => {
    if (input === undefined || input === null || input === '') return '';
    const digits: Record<string, string> = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return String(input).replace(/[0-9]/g, w => digits[w]);
  };

  const handleAddFee = () => {
    const student = students.find(s => s.id === selectedStudentId);
    if (!student || !newFee.amount) {
      alert('দয়া করে শিক্ষার্থী এবং টাকার পরিমাণ সঠিকভাবে নির্বাচন করুন।');
      return;
    }

    const feeEntry: Fee = {
      id: `F-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      studentClass: student.class,
      studentRoll: student.roll,
      amount: Number(newFee.amount),
      month: newFee.month || '',
      type: newFee.type || '',
      date: newFee.date || '',
      receivedBy: newFee.receivedBy || ''
    };

    setFees([feeEntry, ...fees]);
    setSelectedFeeId(feeEntry.id);
    setActiveTab('receipt');
    // Reset partial form
    setSelectedStudentId('');
  };

  const triggerDelete = (id: string) => {
    setFeeToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (feeToDelete) {
      setFees(fees.filter(f => f.id !== feeToDelete));
      setIsDeleteModalOpen(false);
      setFeeToDelete(null);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.class === entryClass && s.session === entrySession);
  }, [students, entryClass, entrySession]);

  const reportData = useMemo(() => {
    return fees.filter(f => {
      const student = students.find(s => s.id === f.studentId);
      const matchesClass = reportClass === 'All' || f.studentClass === reportClass;
      const matchesSession = !student || student.session === reportSession;
      return matchesClass && matchesSession;
    });
  }, [fees, reportClass, reportSession, students]);

  const currentReceipt = useMemo(() => {
    return fees.find(f => f.id === selectedFeeId);
  }, [fees, selectedFeeId]);

  const MadrasaHeader = ({ title }: { title: string }) => (
    <div className="text-center mb-8 border-b-4 border-double border-slate-900 pb-6">
      <div className="flex justify-center items-center gap-6">
        {profile.logo ? (
          <img src={profile.logo} className="w-20 h-20 object-contain" alt="Logo" />
        ) : (
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-white"><GraduationCap size={36} /></div>
        )}
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-900">{profile.name}</h1>
          <p className="text-sm font-bold text-slate-600">{profile.address}</p>
          <p className="text-xs font-bold text-slate-500">মোবাইল: {toBn(profile.phone)}</p>
        </div>
      </div>
      <div className="mt-4 inline-block bg-slate-900 text-white px-8 py-1.5 rounded-full font-bold text-lg tracking-wider">
        {title}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Tab Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 no-print bg-white p-4 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-200">
          <button onClick={() => setActiveTab('entry')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'entry' ? 'bg-white shadow-md text-madrasa-900' : 'text-slate-500'}`}><Plus size={18} /> আদায় এন্ট্রি</button>
          <button onClick={() => setActiveTab('history')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white shadow-md text-madrasa-900' : 'text-slate-500'}`}><Calendar size={18} /> ইতিহাস</button>
          <button onClick={() => setActiveTab('reports')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'reports' ? 'bg-white shadow-md text-madrasa-900' : 'text-slate-500'}`}><FileText size={18} /> রিপোর্ট</button>
        </div>
        {activeTab === 'reports' && (
          <button onClick={() => window.print()} className="px-8 py-3 bg-madrasa-900 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"><Printer size={20} /> রিপোর্ট প্রিন্ট</button>
        )}
      </div>

      {activeTab === 'entry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print animate-in slide-in-from-bottom-4">
          {/* Left: Student Selection */}
          <div className="lg:col-span-1 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-4"><User className="text-madrasa-700" size={20} /> শিক্ষার্থী নির্বাচন</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">সেশন</label>
                  <select value={entrySession} onChange={(e) => setEntrySession(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-madrasa-500">
                    {sessions.map(s => <option key={s} value={s}>{toBn(s)}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">জামাত</label>
                  <select value={entryClass} onChange={(e) => setEntryClass(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-madrasa-500">
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                {filteredStudents.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all border-2 flex items-center justify-between group ${selectedStudentId === s.id ? 'bg-madrasa-900 border-madrasa-900 text-white shadow-lg' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                  >
                    <div>
                      <p className="font-bold text-sm">{s.name}</p>
                      <p className={`text-[10px] font-bold ${selectedStudentId === s.id ? 'text-madrasa-300' : 'text-slate-400'}`}>রোল: {toBn(s.roll)}</p>
                    </div>
                    <ChevronRight size={18} className={selectedStudentId === s.id ? 'text-white' : 'text-slate-300'} />
                  </button>
                ))}
                {filteredStudents.length === 0 && <p className="text-center py-10 text-slate-400 text-xs font-bold">এই জামাতে কোনো শিক্ষার্থী নেই।</p>}
              </div>
            </div>
          </div>

          {/* Right: Fee Entry Form */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-4"><CreditCard className="text-madrasa-700" size={20} /> ফি জমা এন্ট্রি ফরম</h3>
            {selectedStudentId ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-2">ফির ধরণ</label>
                  <select 
                    value={newFee.type} 
                    onChange={(e) => setNewFee({...newFee, type: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-none ring-1 ring-slate-200 focus:ring-4 focus:ring-madrasa-500/10"
                  >
                    <option value="মাসিক ফি">মাসিক ফি</option>
                    <option value="ভর্তি ফি">ভর্তি ফি</option>
                    <option value="পরীক্ষা ফি">পরীক্ষা ফি</option>
                    <option value="বোর্ড ফি">বোর্ড ফি</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-2">মাস নির্বাচন (প্রয়োজনে)</label>
                  <select 
                    value={newFee.month} 
                    onChange={(e) => setNewFee({...newFee, month: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-none ring-1 ring-slate-200 focus:ring-4 focus:ring-madrasa-500/10"
                  >
                    {['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-2">টাকার পরিমাণ (ইংলিশে লিখুন)</label>
                  <input 
                    type="number" 
                    placeholder="0000" 
                    value={newFee.amount || ''}
                    onChange={(e) => setNewFee({...newFee, amount: Number(e.target.value)})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-2xl text-madrasa-800 outline-none ring-1 ring-slate-200 focus:ring-4 focus:ring-madrasa-500/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-2">তারিখ</label>
                  <input 
                    type="date" 
                    value={newFee.date}
                    onChange={(e) => setNewFee({...newFee, date: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-none ring-1 ring-slate-200 focus:ring-4 focus:ring-madrasa-500/10"
                  />
                </div>
                <div className="md:col-span-2 pt-6">
                  <button 
                    onClick={handleAddFee}
                    className="w-full py-5 bg-madrasa-900 text-white rounded-[24px] font-bold text-xl flex items-center justify-center gap-3 shadow-2xl shadow-madrasa-900/20 hover:scale-[1.02] transition-transform"
                  >
                    <Save size={24} /> ফি জমা করুন এবং রশিদ প্রিন্ট দিন
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6"><User size={40} className="text-slate-200" /></div>
                <p className="text-slate-400 font-bold">বাম পাশের তালিকা থেকে শিক্ষার্থী নির্বাচন করুন।</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden no-print animate-in fade-in">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
             <h3 className="font-bold text-slate-800">সাম্প্রতিক জমার তালিকা</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">তারিখ</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">শিক্ষার্থীর নাম</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">বিবরণ</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">পরিমাণ</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {fees.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-500 text-sm">{toBn(f.date)}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm">{f.studentName}</div>
                      <div className="text-[10px] text-slate-400">রোল: {toBn(f.studentRoll)} | {f.studentClass}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-madrasa-700 text-sm">{f.month} - {f.type}</td>
                    <td className="px-6 py-4 text-right font-black text-lg">৳ {toBn(f.amount.toLocaleString())}</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => { setSelectedFeeId(f.id); setActiveTab('receipt'); }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="রশিদ দেখুন"
                          ><Receipt size={18} /></button>
                          <button 
                            onClick={() => triggerDelete(f.id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                            title="মুছে ফেলুন"
                          ><Trash2 size={18} /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'receipt' && currentReceipt && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex justify-between items-center no-print">
            <button onClick={() => setActiveTab('entry')} className="text-slate-500 font-bold flex items-center gap-2"><X size={20} /> বন্ধ করুন</button>
            <button onClick={() => window.print()} className="px-10 py-3 bg-madrasa-900 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl"><Printer size={20} /> রশিদ প্রিন্ট দিন</button>
          </div>
          <div className="printable-area bg-white p-10 rounded-[40px] border shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none rotate-12">
               <Receipt size={200} />
             </div>
             <MadrasaHeader title="ফি আদায়ের রশিদ" />
             <div className="flex justify-between mb-8 font-bold text-slate-700">
                <p>রশিদ নং: {toBn(currentReceipt.id.split('-')[1])}</p>
                <p>তারিখ: {toBn(currentReceipt.date)}</p>
             </div>
             <div className="space-y-4 border-2 border-slate-900 p-8 rounded-[32px] bg-slate-50/50">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                   <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">শিক্ষার্থীর নাম</span>
                   <span className="font-black text-xl text-slate-900">{currentReceipt.studentName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                   <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">জামাত ও রোল</span>
                   <span className="font-bold text-slate-800">{currentReceipt.studentClass} | {toBn(currentReceipt.studentRoll)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                   <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">বিবরণ</span>
                   <span className="font-bold text-madrasa-800">{currentReceipt.month} - {currentReceipt.type}</span>
                </div>
                <div className="flex justify-between pt-4">
                   <span className="text-slate-900 font-black text-xl uppercase tracking-widest">প্রদানকৃত টাকা</span>
                   <span className="font-black text-4xl text-slate-900">৳ {toBn(currentReceipt.amount.toLocaleString())}/-</span>
                </div>
             </div>
             <div className="mt-12 text-center text-[10px] font-bold text-slate-400 italic">
                উক্ত ফি সঠিকভাবে আদায় করা হয়েছে। এই রশিদটি ভবিষ্যতে সংরক্ষণের জন্য অনুরোধ করা হলো।
             </div>
             <div className="print-only hidden pt-20 flex justify-between">
                <div className="border-t-2 border-black pt-2 px-6 font-bold">আদায়কারী</div>
                <div className="border-t-2 border-black pt-2 px-6 font-bold">অফিস সীল</div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 no-print">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">সেশন ফিল্টার</label>
                  <select value={reportSession} onChange={(e) => setReportSession(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none ring-1 ring-slate-200">
                    {sessions.map(s => <option key={s} value={s}>{toBn(s)}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">জামাত ফিল্টার</label>
                  <select value={reportClass} onChange={(e) => setReportClass(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none ring-1 ring-slate-200">
                    <option value="All">সকল জামাত</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
             </div>
          </div>
          <div className="printable-area bg-white rounded-[40px] border shadow-sm p-12">
            <MadrasaHeader title={`ফি আদায়ের সামগ্রিক রিপোর্ট - সেশন: ${toBn(reportSession)}`} />
            <table className="w-full border-collapse border-2 border-black text-center">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-black">
                  <th className="px-6 py-5 border-r border-black font-black">আইডি ও রোল</th>
                  <th className="px-6 py-5 border-r border-black text-left font-black">শিক্ষার্থীর নাম ও জামাত</th>
                  <th className="px-6 py-4 border-r border-black font-black">বিবরণ</th>
                  <th className="px-6 py-4 font-black">টাকার পরিমাণ</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b border-black">
                {reportData.map(f => (
                  <tr key={f.id} className="border-b border-black">
                    <td className="px-6 py-4 border-r border-black font-bold">{toBn(f.studentId)} | {toBn(f.studentRoll)}</td>
                    <td className="px-6 py-4 border-r border-black font-bold text-left">{f.studentName} ({f.studentClass})</td>
                    <td className="px-6 py-4 border-r border-black font-bold text-slate-600">{f.month} - {f.type}</td>
                    <td className="px-6 py-4 font-black text-xl">৳ {toBn(f.amount.toLocaleString())}</td>
                  </tr>
                ))}
                {reportData.length === 0 && (
                  <tr><td colSpan={4} className="py-20 text-center font-bold text-slate-400">এই ফিল্টারে কোনো তথ্য পাওয়া যায়নি।</td></tr>
                )}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-black">
                 <tr>
                   <td colSpan={3} className="px-6 py-6 text-right uppercase tracking-widest text-lg border-r border-white/20">সর্বমোট আদায়কৃত টাকা:</td>
                   <td className="px-6 py-6 text-right text-3xl font-black">৳ {toBn(reportData.reduce((acc, f) => acc + f.amount, 0).toLocaleString())}</td>
                 </tr>
              </tfoot>
            </table>
            <div className="print-only hidden pt-32 grid grid-cols-2 gap-20 text-center">
                <div className="border-t-2 border-black pt-4 font-black">পরীক্ষা নিয়ন্ত্রক / ক্যাশিয়ার</div>
                <div className="border-t-2 border-black pt-4 font-black">মুহতামীম / প্রিন্সিপাল</div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">আপনি কি নিশ্চিত?</h3>
            <p className="text-slate-500 text-sm mb-8">আপনি কি এই জমার রেকর্ডটি মুছে ফেলতে চান? ডিলিট করার পর তথ্য আর ফিরে পাওয়া যাবে না।</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
              >
                বাতিল
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 text-white font-bold bg-red-500 rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-200"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;