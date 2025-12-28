
import React, { useState, useMemo } from 'react';
import { 
  FileText, Plus, Trash2, Printer, LayoutGrid, ListChecks, 
  Settings2, CheckCircle, User, BookOpen, ChevronRight, X, GraduationCap
} from 'lucide-react';
import { Student, ExamResult, SubjectMark, MadrasaProfile } from '../types';

interface ResultsProps {
  students: Student[];
  marksData: Record<string, Record<string, number | string>>;
  setMarksData: React.Dispatch<React.SetStateAction<Record<string, Record<string, number | string>>>>;
  subjectsByClass: Record<string, string[]>;
  setSubjectsByClass: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  examTypes: string[];
  setExamTypes: React.Dispatch<React.SetStateAction<string[]>>;
  profile: MadrasaProfile;
  classes: string[];
  sessions: string[];
}

const Results: React.FC<ResultsProps> = ({ 
  students, marksData, setMarksData, subjectsByClass, setSubjectsByClass, examTypes, setExamTypes, profile, classes, sessions
}) => {
  const [activeTab, setActiveTab] = useState<'entry' | 'sheet' | 'marksheet' | 'config'>('entry');
  const [selectedSession, setSelectedSession] = useState(sessions[sessions.length - 1] || '২০২৪-২৫');
  const [selectedClass, setSelectedClass] = useState(classes[0] || 'কায়দা');
  const [selectedExamType, setSelectedExamType] = useState(examTypes[0] || '১ম সাময়িক');
  
  const [newSubject, setNewSubject] = useState('');
  const [newExamType, setNewExamType] = useState('');

  // Local derived subjects list for current class
  const currentSubjects = useMemo(() => subjectsByClass[selectedClass] || [], [subjectsByClass, selectedClass]);

  const toBn = (input: string | number | undefined | null) => {
    if (input === undefined || input === null || input === '') return '';
    const digits: Record<string, string> = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return String(input).replace(/[0-9]/g, w => digits[w]);
  };

  const handleMarkChange = (studentId: string, subject: string, val: string) => {
    const key = `${selectedSession}_${selectedClass}_${selectedExamType}_${studentId}`;
    setMarksData(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [subject]: val }
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    let nextRow = rowIdx, nextCol = colIdx;
    switch (e.key) {
      case 'ArrowUp': nextRow = Math.max(0, rowIdx - 1); break;
      case 'ArrowDown':
      case 'Enter': nextRow = rowIdx + 1; break;
      case 'ArrowLeft': nextCol = Math.max(0, colIdx - 1); break;
      case 'ArrowRight': nextCol = colIdx + 1; break;
      default: return;
    }
    const nextEl = document.getElementById(`mark-input-${nextRow}-${nextCol}`);
    if (nextEl) {
      e.preventDefault();
      nextEl.focus();
      // @ts-ignore
      nextEl.select();
    }
  };

  const calculateGrade = (avg: number) => {
    if (avg >= 80) return 'মুমতাজ';
    if (avg >= 65) return 'জায়্যিদ জিদ্দান';
    if (avg >= 50) return 'জায়্যিদ';
    if (avg >= 33) return 'মাকবুল';
    return 'রাসিব';
  };

  const computedResults = useMemo(() => {
    const classStudents = students.filter(s => s.class === selectedClass && s.session === selectedSession);
    const results: (ExamResult & { address?: string })[] = classStudents.map(student => {
      const key = `${selectedSession}_${selectedClass}_${selectedExamType}_${student.id}`;
      const studentMarks = marksData[key] || {};
      let total = 0, missingCount = 0;
      
      const marksList: SubjectMark[] = currentSubjects.map(sub => {
        const val = studentMarks[sub];
        const numVal = (val !== undefined && val !== '') ? Number(val) : null;
        if (numVal !== null) { total += numVal; } else { missingCount++; }
        return { subjectName: sub, mark: numVal };
      });

      const avg = currentSubjects.length > 0 ? total / currentSubjects.length : 0;
      let status: 'Pass' | 'Fail' | 'Absent' | 'Suspended' = 'Pass';
      let grade = '';

      if (missingCount === currentSubjects.length) { status = 'Absent'; grade = 'অনুপস্থিত'; }
      else if (missingCount > 0) { status = 'Suspended'; grade = 'স্থগিত'; }
      else {
        if (avg < 33) { status = 'Fail'; grade = 'রাসিব'; }
        else { status = 'Pass'; grade = calculateGrade(avg); }
      }

      return {
        id: `RES-${student.id}`, studentId: student.id, studentName: student.name, roll: student.roll,
        class: selectedClass, session: selectedSession, examType: selectedExamType, marks: marksList,
        totalMarks: total, average: parseFloat(avg.toFixed(2)), grade: grade, status: status,
        address: student.address
      };
    });

    const meritList = results.filter(r => r.status === 'Pass' || r.status === 'Fail').sort((a, b) => b.totalMarks - a.totalMarks);
    return results.map(r => {
      const meritPos = meritList.findIndex(m => m.studentId === r.studentId);
      return { ...r, meritPosition: (r.status === 'Pass' || r.status === 'Fail') ? meritPos + 1 : undefined };
    });
  }, [selectedClass, selectedSession, selectedExamType, marksData, currentSubjects, students]);

  // Result sheet chunking (14 per page as requested)
  const chunkedResults = useMemo(() => {
    const size = 14;
    const chunks = [];
    for (let i = 0; i < computedResults.length; i += size) { chunks.push(computedResults.slice(i, i + size)); }
    return chunks;
  }, [computedResults]);

  // Marksheet chunking (2 per page side-by-side)
  const chunkedMarksheets = useMemo(() => {
    const size = 2;
    const chunks = [];
    for (let i = 0; i < computedResults.length; i += size) { chunks.push(computedResults.slice(i, i + size)); }
    return chunks;
  }, [computedResults]);

  const MadrasaHeader = ({ customTitle, isSmall }: { customTitle?: string, isSmall?: boolean }) => (
    <div className={`text-center ${isSmall ? 'mb-2 pb-2' : 'mb-6 pb-4'} border-b-4 border-double border-slate-900`}>
      <div className="flex justify-center items-center gap-4">
        {profile.logo && !isSmall && <img src={profile.logo} className="w-12 h-12 object-contain" alt="Logo" />}
        <div className="text-center">
          <h1 className={`${isSmall ? 'text-xl' : 'text-2xl md:text-3xl'} font-black text-slate-900 leading-tight`}>{profile.name}</h1>
          <p className={`${isSmall ? 'text-[10px]' : 'text-sm'} font-bold text-slate-600 leading-tight`}>{profile.address}</p>
        </div>
      </div>
      <div className={`${isSmall ? 'mt-1' : 'mt-2'} flex justify-center`}>
        <span className={`bg-slate-900 text-white ${isSmall ? 'px-4 py-0.5 text-xs' : 'px-6 py-1 text-md'} rounded-full font-bold shadow-sm`}>
          {customTitle || `${selectedExamType} - ${toBn(selectedSession)}`}
        </span>
      </div>
    </div>
  );

  const addSubject = () => {
    if (!newSubject.trim()) return;
    setSubjectsByClass(prev => ({
      ...prev,
      [selectedClass]: [...(prev[selectedClass] || []), newSubject.trim()]
    }));
    setNewSubject('');
  };

  const removeSubject = (sub: string) => {
    setSubjectsByClass(prev => ({
      ...prev,
      [selectedClass]: (prev[selectedClass] || []).filter(s => s !== sub)
    }));
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 no-print">
        <div className="flex flex-col lg:flex-row gap-6 items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">সেশন নির্বাচন</label>
              <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900">
                {sessions.map(s => <option key={s} value={s}>{toBn(s)}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">জামাত নির্বাচন</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900">
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">পরীক্ষার ধরণ</label>
              <select value={selectedExamType} onChange={(e) => setSelectedExamType(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900">
                {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button onClick={() => setActiveTab('entry')} className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'entry' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}><LayoutGrid size={18} /> এন্ট্রি</button>
            <button onClick={() => setActiveTab('sheet')} className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'sheet' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}><ListChecks size={18} /> রেজাল্ট শীট</button>
            <button onClick={() => setActiveTab('marksheet')} className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'marksheet' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}><FileText size={18} /> মার্কশীট</button>
            <button onClick={() => setActiveTab('config')} className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'config' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}><Settings2 size={18} /> সাবজেক্ট</button>
          </div>
        </div>
      </div>

      {activeTab === 'entry' && (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden no-print animate-in fade-in duration-500">
          <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-800">পরীক্ষার নাম্বার এন্ট্রি - {selectedClass}</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">Arrow Keys বা Enter ব্যবহার করে এক ঘর থেকে অন্য ঘরে যেতে পারবেন।</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="px-8 py-5 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">শিক্ষার্থীর নাম</th>
                  <th className="px-4 py-5 text-center font-bold text-slate-500 uppercase tracking-widest text-[10px]">রোল</th>
                  {currentSubjects.map(sub => <th key={sub} className="px-4 py-5 text-center text-[10px] font-bold text-slate-700 bg-slate-100/50 uppercase tracking-widest border-l">{sub}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.filter(s => s.class === selectedClass && s.session === selectedSession).map((student, rowIdx) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 font-bold text-slate-800 whitespace-nowrap">{student.name}</td>
                    <td className="px-4 py-5 text-center font-bold text-slate-400">{toBn(student.roll)}</td>
                    {currentSubjects.map((sub, colIdx) => (
                      <td key={sub} className="px-3 py-5 border-l">
                        <input id={`mark-input-${rowIdx}-${colIdx}`} type="number" placeholder="--"
                          value={marksData[`${selectedSession}_${selectedClass}_${selectedExamType}_${student.id}`]?.[sub] || ''}
                          onChange={(e) => handleMarkChange(student.id, sub, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                          className="w-full max-w-[80px] mx-auto block text-center py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-madrasa-500 transition-all focus:bg-white focus:shadow-sm"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sheet' && (
        <div className="space-y-6">
          <div className="flex justify-end no-print">
            <button onClick={() => window.print()} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-3 shadow-2xl transition-transform hover:scale-105"><Printer size={22} /> রেজাল্ট শীট প্রিন্ট করুন (Landscape)</button>
          </div>
          <div className="printable-area apply-landscape space-y-0" style={{ maxWidth: '10.5in', margin: '0 auto' }}>
            {chunkedResults.map((chunk, pageIdx) => (
              <div key={pageIdx} className="bg-white p-[0.3in] border shadow-sm" style={{ minHeight: '8in', pageBreakAfter: 'always' }}>
                <MadrasaHeader />
                <div className="text-center mb-4">
                   <h2 className="text-xl font-black text-slate-900 underline underline-offset-4 decoration-2">ফলাফল তালিকা (Tabulation Sheet)</h2>
                   <div className="mt-2 flex justify-center gap-6 font-bold text-slate-700 text-xs">
                      <p>জামাত: {selectedClass}</p>
                      <p>সেশন: {toBn(selectedSession)}</p>
                      <p>পৃষ্ঠা: {toBn(pageIdx + 1)}</p>
                   </div>
                </div>
                <table className="w-full text-center border-collapse border-2 border-black">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-black">
                      <th className="px-1 py-2 border-r border-black font-black text-[10px]">রোল</th>
                      <th className="px-3 py-2 text-left border-r border-black font-black text-[10px]">শিক্ষার্থীর নাম</th>
                      {currentSubjects.map(sub => <th key={sub} className="px-0.5 py-2 text-[9px] font-bold border-r border-black whitespace-nowrap">{sub}</th>)}
                      <th className="px-1 py-2 bg-slate-200 font-black border-r border-black text-[10px]">মোট</th>
                      <th className="px-1 py-2 bg-slate-50 font-black border-r border-black text-[10px]">গড়</th>
                      <th className="px-1 py-2 font-black border-r border-black text-[10px]">গ্রেড</th>
                      <th className="px-1 py-2 font-black text-[10px]">স্থান</th>
                    </tr>
                  </thead>
                  <tbody className="border-b-2 border-black">
                    {chunk.map(res => (
                      <tr key={res.id} className="border-b border-black">
                        <td className="py-2 font-bold border-r border-black text-sm">{toBn(res.roll)}</td>
                        <td className="text-left font-bold px-3 border-r border-black text-sm truncate max-w-[150px]">{res.studentName}</td>
                        {res.marks.map((m, i) => <td key={i} className="py-2 border-r border-black font-bold text-sm">{m.mark !== null ? toBn(m.mark) : '--'}</td>)}
                        <td className="font-black bg-slate-200 py-2 border-r border-black text-md">{toBn(res.totalMarks)}</td>
                        <td className="font-black bg-slate-50 py-2 border-r border-black text-md">{toBn(res.average)}</td>
                        <td className={`font-black py-2 text-xs border-r border-black ${res.status === 'Fail' ? 'text-red-600' : ''}`}>{res.grade}</td>
                        <td className="font-black py-2 text-md">{res.meritPosition ? toBn(res.meritPosition) : '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-12 grid grid-cols-2 gap-20 text-center px-10 no-screen print:flex print:justify-between">
                   <div className="border-t border-black pt-1 font-black text-sm w-48">নাজিমে তালীমাত</div>
                   <div className="border-t border-black pt-1 font-black text-sm w-48">মুহতামীম / প্রিন্সিপাল</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'marksheet' && (
        <div className="space-y-6">
          <div className="flex justify-end no-print">
            <button onClick={() => window.print()} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-3 shadow-2xl transition-transform hover:scale-105"><Printer size={22} /> মার্কশীট প্রিন্ট করুন (Landscape)</button>
          </div>
          <div className="printable-area apply-landscape space-y-0" style={{ maxWidth: '10.5in', margin: '0 auto' }}>
            {chunkedMarksheets.map((chunk, pageIdx) => (
              <div key={pageIdx} className="marksheet-page-container bg-white p-[0.3in] flex justify-between gap-[0.6in]" style={{ pageBreakAfter: 'always', height: '8.27in' }}>
                {chunk.map((res, resIdx) => (
                  <div key={resIdx} className="bg-white border-2 border-slate-900 rounded-[24px] p-6 flex flex-col relative overflow-hidden" style={{ width: 'calc(50% - 0.3in)', height: '100%' }}>
                    <MadrasaHeader customTitle="নম্বরপত্র (Mark Sheet)" isSmall />
                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="space-y-0.5">
                        <div className="flex gap-2"><span className="text-[9px] font-black text-slate-400 uppercase">নাম:</span><span className="text-sm font-black">{res.studentName}</span></div>
                        <div className="flex gap-2"><span className="text-[9px] font-black text-slate-400 uppercase">জামাত:</span><span className="text-xs font-bold">{res.class}</span></div>
                        <div className="flex gap-2"><span className="text-[9px] font-black text-slate-400 uppercase">ঠিকানা:</span><span className="text-[10px] font-bold truncate max-w-[140px]">{res.address || 'N/A'}</span></div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className="flex justify-end gap-2"><span className="text-[9px] font-black text-slate-400 uppercase">রোল:</span><span className="text-sm font-black">{toBn(res.roll)}</span></div>
                        <div className="flex justify-end gap-2"><span className="text-[9px] font-black text-slate-400 uppercase">সেশন:</span><span className="text-xs font-bold">{toBn(res.session)}</span></div>
                        <div className="flex justify-end gap-2"><span className="text-[9px] font-black text-slate-400 uppercase">পরীক্ষার ধরন:</span><span className="text-[10px] font-bold">{res.examType}</span></div>
                      </div>
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <table className="w-full text-center border-collapse border border-black text-xs">
                        <thead>
                          <tr className="bg-slate-100"><th className="py-1.5 border-r border-black font-black">বিষয়সমূহ</th><th className="py-1.5 border-r border-black font-black">পূর্ণমান</th><th className="py-1.5 font-black">প্রাপ্ত নম্বর</th></tr>
                        </thead>
                        <tbody>
                          {res.marks.map((m, i) => (
                            <tr key={i} className="border-t border-black"><td className="py-1 px-4 text-left border-r border-black font-bold">{m.subjectName}</td><td className="py-1 border-r border-black font-bold">{toBn(100)}</td><td className="py-1 font-black">{m.mark !== null ? toBn(m.mark) : '--'}</td></tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t border-black bg-slate-50 font-black">
                          <tr><td colSpan={2} className="py-1.5 text-right px-4 border-r border-black">সর্বমোট নম্বর ও গড়:</td><td className="py-1.5 text-sm">{toBn(res.totalMarks)} (গড়: {toBn(res.average)})</td></tr>
                          <tr className="border-t border-black"><td colSpan={2} className="py-1.5 text-right px-4 border-r border-black">ফলাফল / গ্রেড:</td><td className={`py-1.5 text-sm font-black ${res.status === 'Fail' ? 'text-red-600' : 'text-emerald-700'}`}>{res.grade}</td></tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="mt-8 flex justify-between px-4">
                       <div className="border-t border-black pt-1 px-4 font-black text-[11px] w-28 text-center">অভিভাবক</div>
                       <div className="border-t border-black pt-1 px-4 font-black text-[11px] w-28 text-center">নাজিমে তালীমাত</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 no-print animate-in zoom-in-95 duration-300">
           <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-900 text-white rounded-2xl"><BookOpen size={24} /></div>
                <div><h3 className="font-black text-xl text-slate-900">সাবজেক্ট ব্যবস্থাপনা ({selectedClass})</h3></div>
              </div>
              <div className="flex gap-2 mb-8">
                <input type="text" placeholder="বিষয়ের নাম..." value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="flex-1 px-5 py-3.5 bg-slate-50 border rounded-2xl font-bold text-sm" />
                <button onClick={addSubject} className="p-4 bg-slate-900 text-white rounded-2xl"><Plus size={24} /></button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                 {currentSubjects.map((sub, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group border border-transparent hover:border-slate-200">
                      <span className="font-bold text-slate-800">{sub}</span>
                      <button onClick={() => removeSubject(sub)} className="p-2 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                   </div>
                 ))}
                 {currentSubjects.length === 0 && <p className="text-center py-10 text-slate-400 font-bold italic">এই জামাতে কোনো সাবজেক্ট যুক্ত করা নেই।</p>}
              </div>
           </div>

           <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-800 text-white rounded-2xl"><Settings2 size={24} /></div>
                <div><h3 className="font-black text-xl text-slate-900">পরীক্ষার নাম ম্যানেজ</h3></div>
              </div>
              <div className="flex gap-2 mb-8">
                <input type="text" placeholder="পরীক্ষার নাম..." value={newExamType} onChange={(e) => setNewExamType(e.target.value)} className="flex-1 px-5 py-3.5 bg-slate-50 border rounded-2xl font-bold text-sm" />
                <button onClick={() => { if(newExamType) { setExamTypes(prev => [...prev, newExamType]); setNewExamType(''); }}} className="p-4 bg-slate-800 text-white rounded-2xl"><Plus size={24} /></button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                 {examTypes.map((type, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group border border-transparent hover:border-slate-200">
                      <span className="font-bold text-slate-800">{type}</span>
                      <button onClick={() => setExamTypes(prev => prev.filter(t => t !== type))} className="p-2 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Results;
