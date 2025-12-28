
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Printer, BookOpen, Settings2, Save, X, GraduationCap
} from 'lucide-react';
import { Student, ExamResult, SubjectMark, MadrasaProfile } from '../types';

interface ResultsProps {
  students: Student[];
  marksData: Record<string, Record<string, number | string>>;
  setMarksData: React.Dispatch<React.SetStateAction<Record<string, Record<string, number | string>>>>;
  subjects: Record<string, string[]>;
  setSubjects: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  examTypes: string[];
  setExamTypes: React.Dispatch<React.SetStateAction<string[]>>;
  profile: MadrasaProfile;
  classes: string[];
  sessions: string[];
}

const Results: React.FC<ResultsProps> = ({ 
  students, marksData, setMarksData, subjects, setSubjects, examTypes, setExamTypes, profile, classes, sessions
}) => {
  const [activeTab, setActiveTab] = useState<'entry' | 'sheet' | 'marksheet' | 'config'>('entry');
  const [selectedSession, setSelectedSession] = useState(sessions[sessions.length - 1] || '২০২৪-২৫');
  const [selectedClass, setSelectedClass] = useState(classes[0] || 'কায়দা');
  const [selectedExamType, setSelectedExamType] = useState(examTypes[0] || '১ম সাময়িক');
  
  const [newSubject, setNewSubject] = useState('');
  const [newExamType, setNewExamType] = useState('');

  const currentClassSubjects = useMemo(() => subjects[selectedClass] || [], [subjects, selectedClass]);

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
    let nextRow = rowIdx;
    let nextCol = colIdx;
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
      // @ts-ignore
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
    const results: ExamResult[] = classStudents.map(student => {
      const key = `${selectedSession}_${selectedClass}_${selectedExamType}_${student.id}`;
      const studentMarks = marksData[key] || {};
      let total = 0, count = 0, missingCount = 0;
      
      const marksList: SubjectMark[] = currentClassSubjects.map(sub => {
        const val = studentMarks[sub];
        const numVal = (val !== undefined && val !== '') ? Number(val) : null;
        if (numVal !== null) { total += numVal; count++; } else { missingCount++; }
        return { subjectName: sub, mark: numVal };
      });

      const avg = currentClassSubjects.length > 0 ? total / currentClassSubjects.length : 0;
      let status: 'Pass' | 'Fail' | 'Absent' | 'Suspended' = 'Pass';
      let grade = '';

      if (missingCount === currentClassSubjects.length) { status = 'Absent'; grade = 'অনুপস্থিত'; }
      else if (missingCount > 0) { status = 'Suspended'; grade = 'স্থগিত'; }
      else { if (avg < 33) { status = 'Fail'; grade = 'রাসিব'; } else { status = 'Pass'; grade = calculateGrade(avg); } }

      return {
        id: `RES-${student.id}`, studentId: student.id, studentName: student.name, roll: student.roll,
        class: selectedClass, session: selectedSession, examType: selectedExamType, marks: marksList,
        totalMarks: total, average: parseFloat(avg.toFixed(2)), grade: grade, status: status
      };
    });

    const meritList = results.filter(r => r.status === 'Pass' || r.status === 'Fail').sort((a, b) => b.totalMarks - a.totalMarks);
    return results.map(r => {
      const meritPos = meritList.findIndex(m => m.studentId === r.studentId);
      return { ...r, meritPosition: (r.status === 'Pass' || r.status === 'Fail') ? meritPos + 1 : undefined };
    });
  }, [selectedClass, selectedSession, selectedExamType, marksData, currentClassSubjects, students]);

  const chunkedResults = useMemo(() => {
    const size = 14;
    const chunks = [];
    for (let i = 0; i < computedResults.length; i += size) { chunks.push(computedResults.slice(i, i + size)); }
    return chunks;
  }, [computedResults]);

  const chunkedMarksheets = useMemo(() => {
    const size = 2;
    const chunks = [];
    for (let i = 0; i < computedResults.length; i += size) { chunks.push(computedResults.slice(i, i + size)); }
    return chunks;
  }, [computedResults]);

  const MadrasaHeader = ({ customTitle, isSmall }: { customTitle?: string, isSmall?: boolean }) => (
    <div className={`text-center ${isSmall ? 'mb-0.5' : 'mb-1'} leading-none`}>
      <div className="flex justify-center items-center gap-2">
        {profile.logo && !isSmall && <img src={profile.logo} className="w-8 h-8 object-contain" alt="Logo" />}
        <div className="text-center">
          <h1 className={`${isSmall ? 'text-lg' : 'text-xl'} font-black text-slate-900 leading-tight uppercase`}>{profile.name}</h1>
          <p className={`${isSmall ? 'text-[8px]' : 'text-[9px]'} font-bold text-slate-600 leading-none`}>{profile.address}</p>
          <div className={`mt-0.5 font-black text-slate-800 ${isSmall ? 'text-[9px]' : 'text-[10px]'}`}>
            {selectedExamType} পরীক্ষা - {toBn(selectedSession)}
          </div>
        </div>
      </div>
      {!isSmall && (
        <div className="mt-1 flex justify-center">
          <span className="bg-slate-900 text-white px-6 py-0.5 text-[10px] rounded-full font-bold shadow-sm uppercase tracking-widest">
            {customTitle || 'ফলাফল তালিকা (Tabulation Sheet)'}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 landscape !important; margin: 0.3in !important; }
          .no-print { display: none !important; }
          .printable-area { width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; }
          
          .page-container { 
            page-break-after: always !important; 
            display: flex !important; 
            flex-direction: column !important; 
            min-height: 7.2in !important; 
            height: 7.2in !important;
            overflow: hidden !important;
            position: relative;
          }

          .landscape-table { width: 100% !important; border-collapse: collapse !important; border: 1.5px solid #000 !important; }
          .landscape-table th, .landscape-table td { border: 1px solid #000 !important; padding: 1.5px 2px !important; font-size: 9pt !important; text-align: center; }
          .landscape-table th { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; font-weight: 900 !important; }

          .marksheet-grid { 
            display: grid !important; 
            grid-template-cols: 1fr 1fr !important; 
            gap: 0.6in !important; 
            width: 100% !important; 
          }
          .marksheet-card { 
            border: 1.5px solid #000 !important; 
            border-radius: 8px !important; 
            padding: 10px !important; 
            display: flex !important; 
            flex-direction: column !important; 
            height: 7in !important; 
            box-sizing: border-box !important;
            position: relative;
          }
          
          .print-signature-footer {
            position: absolute;
            bottom: 0.1in;
            left: 0;
            right: 0;
            display: flex !important;
            justify-content: space-between !important;
            padding: 0 0.4in !important;
          }
        }
      ` }} />

      {/* Tabs and Filters (No-Print) */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 no-print">
        <div className="flex flex-col lg:flex-row gap-6 items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm font-bold">
              {sessions.map(s => <option key={s} value={s}>{toBn(s)}</option>)}
            </select>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm font-bold">
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={selectedExamType} onChange={(e) => setSelectedExamType(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm font-bold">
              {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button onClick={() => setActiveTab('entry')} className={`px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'entry' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>এন্ট্রি</button>
            <button onClick={() => setActiveTab('sheet')} className={`px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'sheet' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>রেজাল্ট শীট</button>
            <button onClick={() => setActiveTab('marksheet')} className={`px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'marksheet' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>মার্কশীট</button>
            <button onClick={() => setActiveTab('config')} className={`px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'config' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>কনফিগ</button>
          </div>
        </div>
      </div>

      {activeTab === 'entry' && (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden no-print">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="px-8 py-5 text-left font-bold text-slate-500 uppercase text-[10px]">শিক্ষার্থীর নাম</th>
                  <th className="px-4 py-5 text-center font-bold text-slate-500 uppercase text-[10px]">রোল</th>
                  {currentClassSubjects.map(sub => <th key={sub} className="px-4 py-5 text-center text-[10px] font-black text-slate-700 bg-slate-100/30 border-l">{sub}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.filter(s => s.class === selectedClass && s.session === selectedSession).map((student, rowIdx) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-800 whitespace-nowrap">{student.name}</td>
                    <td className="px-4 py-5 text-center font-black text-slate-400">{toBn(student.roll)}</td>
                    {currentClassSubjects.map((sub, colIdx) => (
                      <td key={sub} className="px-3 py-5 border-l">
                        <input 
                          id={`mark-input-${rowIdx}-${colIdx}`} type="number"
                          value={marksData[`${selectedSession}_${selectedClass}_${selectedExamType}_${student.id}`]?.[sub] || ''}
                          onChange={(e) => handleMarkChange(student.id, sub, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                          className="w-full max-w-[70px] mx-auto block text-center py-2 bg-slate-50 border rounded-xl text-sm font-black focus:ring-2 focus:ring-slate-900"
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
            <button onClick={() => window.print()} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-3 shadow-2xl">
              <Printer size={22} /> রেজাল্ট শীট প্রিন্ট (Landscape)
            </button>
          </div>
          <div className="printable-area">
            {chunkedResults.map((chunk, pageIdx) => (
              <div key={pageIdx} className="page-container p-1 bg-white">
                <MadrasaHeader />
                <div className="flex justify-center gap-10 font-bold text-slate-800 text-[9px] mb-0.5 uppercase leading-none">
                  <span>জামাত: {selectedClass}</span>
                  <span>সেশন: {toBn(selectedSession)}</span>
                  <span>পৃষ্ঠা: {toBn(pageIdx + 1)}</span>
                </div>
                <div className="flex-grow">
                  <table className="landscape-table">
                    <thead>
                      <tr>
                        <th style={{ width: '30px' }}>রোল</th>
                        <th style={{ textAlign: 'left', paddingLeft: '6px' }}>শিক্ষার্থীর নাম</th>
                        {currentClassSubjects.map(sub => <th key={sub} className="text-[7.5pt] whitespace-nowrap">{sub}</th>)}
                        <th className="bg-slate-100" style={{ width: '40px' }}>মোট</th>
                        <th className="bg-slate-50" style={{ width: '40px' }}>গড়</th>
                        <th style={{ width: '60px' }}>গ্রেড</th>
                        <th style={{ width: '40px' }}>মেধা</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chunk.map(res => (
                        <tr key={res.id}>
                          <td className="font-bold">{toBn(res.roll)}</td>
                          <td className="text-left px-2 font-black text-[9.5pt]">{res.studentName}</td>
                          {res.marks.map((m, i) => <td key={i} className="font-bold">{m.mark !== null ? toBn(m.mark) : '--'}</td>)}
                          <td className="font-black bg-slate-100">{toBn(res.totalMarks)}</td>
                          <td className="font-black bg-slate-50">{toBn(res.average)}</td>
                          <td className={`font-black text-[8.5pt] ${res.status === 'Fail' ? 'text-red-600' : ''}`}>{res.grade}</td>
                          <td className="font-black">{res.meritPosition ? toBn(res.meritPosition) : '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="print-signature-footer">
                  <div className="text-center w-36 border-t border-black pt-1 font-black text-[8.5pt] uppercase">নাজীমে তালীমাত</div>
                  <div className="text-center w-36 border-t border-black pt-1 font-black text-[8.5pt] uppercase">মুহতামীম / প্রিন্সিপাল</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'marksheet' && (
        <div className="space-y-6">
          <div className="flex justify-end no-print">
            <button onClick={() => window.print()} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-3 shadow-2xl">
              <Printer size={22} /> মার্কশীট প্রিন্ট (Landscape)
            </button>
          </div>
          <div className="printable-area">
            {chunkedMarksheets.map((chunk, pageIdx) => (
              <div key={pageIdx} className="page-container p-0 bg-white">
                <div className="marksheet-grid">
                  {chunk.map((res, resIdx) => (
                    <div key={resIdx} className="marksheet-card">
                      <MadrasaHeader isSmall />
                      <div className="grid grid-cols-2 gap-1 mb-1.5 p-1 bg-slate-50 rounded border border-black/10 text-[9px]">
                        <div><strong>নাম:</strong> {res.studentName}<br/><strong>জামাত:</strong> {res.class}</div>
                        <div className="text-right"><strong>রোল:</strong> {toBn(res.roll)}<br/><strong>সেশন:</strong> {toBn(res.session)}</div>
                      </div>
                      <div className="flex-grow">
                        <table className="w-full border-collapse border border-black text-[8.5px]">
                          <thead>
                            <tr className="bg-slate-100 border-b border-black">
                              <th className="py-0.5 border-r border-black font-black">বিষয়সমূহ</th>
                              <th className="py-0.5 border-r border-black font-black">পূর্ণমান</th>
                              <th className="py-0.5 font-black">প্রাপ্ত নম্বর</th>
                            </tr>
                          </thead>
                          <tbody>
                            {res.marks.map((m, i) => (
                              <tr key={i} className="border-b border-black">
                                <td className="py-1 px-2 text-left border-r border-black font-bold">{m.subjectName}</td>
                                <td className="py-1 border-r border-black font-bold text-center">{toBn(100)}</td>
                                <td className="py-1 font-black text-[9.5px] text-center">{m.mark !== null ? toBn(m.mark) : '--'}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-slate-50 font-black">
                            <tr>
                              <td colSpan={2} className="py-1 text-right px-2 border-r border-black uppercase text-[8px]">সর্বমোট ও গড়:</td>
                              <td className="py-1 text-[9.5px] text-center">{toBn(res.totalMarks)} ({toBn(res.average)})</td>
                            </tr>
                            <tr className="border-t border-black">
                              <td colSpan={2} className="py-1 text-right px-2 border-r border-black uppercase text-[8px]">ফলাফল ও গ্রেড:</td>
                              <td className={`py-1 text-[9.5px] text-center ${res.status === 'Fail' ? 'text-red-600' : 'text-emerald-700'}`}>{res.grade}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      <div className="mt-4 flex justify-between px-2 pb-0.5">
                        <div className="text-center w-24 border-t border-black pt-0.5 font-bold text-[8px] uppercase">অভিভাবক</div>
                        <div className="text-center w-24 border-t border-black pt-0.5 font-bold text-[8px] uppercase">নাজীমে তালীমাত</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print animate-in zoom-in-95">
           <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
              <h3 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-2"><BookOpen className="text-madrasa-600" size={24}/> বিষয় সেটআপ ({selectedClass})</h3>
              <div className="flex gap-2 mb-6">
                <input type="text" placeholder="বিষয়ের নাম..." value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="flex-1 px-5 py-3.5 bg-slate-50 border rounded-2xl font-bold" />
                <button onClick={() => { if(newSubject) { setSubjects(prev => ({...prev, [selectedClass]: [...(prev[selectedClass] || []), newSubject]})); setNewSubject(''); }}} className="p-4 bg-slate-900 text-white rounded-2xl"><Plus size={24}/></button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                 {currentClassSubjects.map((sub, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group border hover:border-slate-200 transition-all">
                      <span className="font-bold text-slate-800">{sub}</span>
                      <button onClick={() => setSubjects(prev => ({...prev, [selectedClass]: (prev[selectedClass] || []).filter(s => s !== sub)}))} className="p-2 text-red-300 hover:text-red-500 bg-red-50 rounded-xl"><Trash2 size={18}/></button>
                   </div>
                 ))}
              </div>
           </div>
           <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
              <h3 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-2"><Settings2 className="text-madrasa-600" size={24}/> পরীক্ষার নাম কনফিগ</h3>
              <div className="flex gap-2 mb-6">
                <input type="text" placeholder="পরীক্ষার নাম..." value={newExamType} onChange={(e) => setNewExamType(e.target.value)} className="flex-1 px-5 py-3.5 bg-slate-50 border rounded-2xl font-bold" />
                <button onClick={() => { if(newExamType) { setExamTypes([...examTypes, newExamType]); setNewExamType(''); }}} className="p-4 bg-slate-800 text-white rounded-2xl"><Plus size={24}/></button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                 {examTypes.map((type, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group border hover:border-slate-200 transition-all">
                      <span className="font-bold text-slate-800">{type}</span>
                      <button onClick={() => setExamTypes(examTypes.filter(t => t !== type))} className="p-2 text-red-300 hover:text-red-500 bg-red-50 rounded-xl"><Trash2 size={18}/></button>
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
