
import React, { useState, useMemo } from 'react';
import { Printer, Search, GraduationCap, X, ChevronRight, User, FileText, Info } from 'lucide-react';
import { Student, MadrasaProfile, SubjectMark } from '../types';

interface MarksheetProps {
  students: Student[];
  marksData: Record<string, Record<string, number | string>>;
  subjectsByClass: Record<string, string[]>;
  examTypes: string[];
  profile: MadrasaProfile;
  classes: string[];
  sessions: string[];
}

const Marksheet: React.FC<MarksheetProps> = ({ 
  students, marksData, subjectsByClass, examTypes, profile, classes, sessions 
}) => {
  const [selectedSession, setSelectedSession] = useState(sessions[sessions.length - 1] || '২০২৪-২৫');
  const [selectedClass, setSelectedClass] = useState(classes[0] || 'কায়দা');
  const [selectedExamType, setSelectedExamType] = useState(examTypes[0] || '১ম সাময়িক');
  const [searchTerm, setSearchTerm] = useState('');

  const toBn = (input: string | number | undefined | null) => {
    if (input === undefined || input === null || input === '') return '';
    const digits: Record<string, string> = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return String(input).replace(/[0-9]/g, w => digits[w]);
  };

  const calculateGrade = (avg: number) => {
    if (avg >= 80) return 'মুমতাজ';
    if (avg >= 65) return 'জায়্যিদ জিদ্দান';
    if (avg >= 50) return 'জায়্যিদ';
    if (avg >= 33) return 'মাকবুল';
    return 'রাসিব';
  };

  const currentSubjects = useMemo(() => subjectsByClass[selectedClass] || [], [subjectsByClass, selectedClass]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.class === selectedClass && 
      s.session === selectedSession &&
      (s.name.includes(searchTerm) || toBn(s.roll).includes(searchTerm))
    );
  }, [students, selectedClass, selectedSession, searchTerm]);

  const computedResults = useMemo(() => {
    return filteredStudents.map(student => {
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
      let grade = calculateGrade(avg);
      let status: 'Pass' | 'Fail' | 'Absent' | 'Suspended' = 'Pass';

      if (missingCount === currentSubjects.length) { grade = 'অনুপস্থিত'; status = 'Absent'; }
      else if (missingCount > 0) { grade = 'স্থগিত'; status = 'Suspended'; }
      else if (avg < 33) { grade = 'রাসিব'; status = 'Fail'; }

      return {
        id: student.id,
        studentName: student.name,
        roll: student.roll,
        fatherName: student.fatherName,
        class: student.class,
        session: student.session,
        examType: selectedExamType,
        marks: marksList,
        totalMarks: total,
        average: parseFloat(avg.toFixed(2)),
        grade: grade,
        status: status
      };
    });
  }, [filteredStudents, selectedSession, selectedClass, selectedExamType, marksData, currentSubjects]);

  const chunkedResults = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < computedResults.length; i += 2) {
      chunks.push(computedResults.slice(i, i + 2));
    }
    return chunks;
  }, [computedResults]);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 no-print control-panel animate-in fade-in sticky top-0 z-40">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">সেশন</label>
            <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900">
              {sessions.map(s => <option key={s} value={s}>{toBn(s)}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">জামাত</label>
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
          <div className="flex gap-2">
             <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="রোল বা নাম..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900" />
             </div>
             <button onClick={() => window.print()} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-slate-900/20">
                <Printer size={20} /> প্রিন্ট
             </button>
          </div>
        </div>
      </div>

      <div className="no-print no-print-info bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800">
         <Info size={20} />
         <p className="text-sm font-bold">ল্যান্ডস্কেপ প্রিন্ট সেটিংসে "Margins: None" সিলেক্ট করুন যদি কোনো সাদা বর্ডার আসে। কার্ড সাইজ: ১৪.০ সেমি x ২০.২ সেমি।</p>
      </div>

      {/* Main Marksheet View */}
      <div className="marksheet-viewer-container">
         {chunkedResults.length > 0 ? (
           chunkedResults.map((chunk, pageIdx) => (
            <div key={pageIdx} className="marksheet-page-grid mx-auto bg-white mb-10 shadow-2xl print:shadow-none print:mb-0">
               {chunk.map((res, idx) => (
                  <div key={idx} className="marksheet-card-fixed">
                     {/* Watermark Logo */}
                     {profile.logo && <img src={profile.logo} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] w-32 grayscale pointer-events-none" alt="watermark" />}
                     
                     {/* Header */}
                     <div className="text-center border-b border-black pb-1 mb-2 relative z-10 shrink-0">
                        <h1 className="text-[14pt] font-black text-slate-900 leading-none truncate">{profile.name}</h1>
                        <p className="text-[8.5pt] font-bold text-slate-600 leading-tight truncate">{profile.address}</p>
                        <div className="mt-1 flex justify-center items-center gap-2">
                           <span className="bg-black text-white px-2 py-0.5 rounded-full font-black text-[8.5pt] uppercase leading-none">{res.examType}</span>
                           <span className="border border-black px-2 py-0.5 rounded-full font-black text-[8.5pt] text-black uppercase leading-none">নম্বরপত্র</span>
                        </div>
                     </div>

                     {/* Student Info */}
                     <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mb-2 text-[9.5pt] font-bold text-slate-800 bg-slate-50/50 p-1.5 rounded-lg border border-slate-300 relative z-10 shrink-0">
                        <div className="flex gap-1 overflow-hidden"><span>নাম:</span><span className="font-black truncate">{res.studentName}</span></div>
                        <div className="flex justify-end gap-1 overflow-hidden"><span>পিতা:</span><span className="font-black truncate">{res.fatherName}</span></div>
                        <div className="flex gap-1"><span>রোল:</span><span className="font-black">{toBn(res.roll)}</span></div>
                        <div className="flex justify-end gap-1"><span>জামাত:</span><span className="font-black">{res.class}</span></div>
                        <div className="flex gap-1"><span>আইডি:</span><span className="font-black">{toBn(res.id)}</span></div>
                        <div className="flex justify-end gap-1"><span>সেশন:</span><span className="font-black">{toBn(res.session)}</span></div>
                     </div>

                     {/* Mark Table (Strictly Fixed) */}
                     <div className="flex-grow flex flex-col min-h-0 relative z-10 overflow-hidden border border-black">
                        <div className="bg-slate-100 border-b border-black flex font-black text-[9pt]">
                            <div className="w-[55%] border-r border-black py-1 px-2 text-left">বিষয়সমূহ</div>
                            <div className="w-[20%] border-r border-black py-1 text-center">পূর্ণমান</div>
                            <div className="w-[25%] py-1 text-center">প্রাপ্ত</div>
                        </div>
                        <div className="flex-grow overflow-hidden flex flex-col">
                            {res.marks.map((m, i) => (
                                <div key={i} className="flex border-b border-slate-200 font-bold text-[9.5pt] shrink-0">
                                    <div className="w-[55%] border-r border-black py-1 px-2 text-left truncate">{m.subjectName}</div>
                                    <div className="w-[20%] border-r border-black py-1 text-center">{toBn(100)}</div>
                                    <div className="w-[25%] py-1 text-center font-black">{m.mark !== null ? toBn(m.mark) : '--'}</div>
                                </div>
                            ))}
                            {/* Filler to push total to bottom */}
                            <div className="flex-grow"></div>
                        </div>
                        <div className="bg-slate-50 border-t border-black flex font-black text-[9.5pt] shrink-0">
                            <div className="w-[75%] border-r border-black py-1.5 text-right px-4">মোট নম্বর ও গড়:</div>
                            <div className="w-[25%] py-1.5 text-center">{toBn(res.totalMarks)} ({toBn(res.average)})</div>
                        </div>
                        <div className="bg-slate-100 border-t border-black flex font-black text-[10pt] shrink-0">
                            <div className="w-[75%] border-r border-black py-1.5 text-right px-4">গ্রেড / ফলাফল:</div>
                            <div className={`w-[25%] py-1.5 text-center ${res.status === 'Fail' ? 'text-red-600' : 'text-emerald-700'}`}>{res.grade}</div>
                        </div>
                     </div>

                     {/* Footer Signature */}
                     <div className="mt-3 flex justify-between px-4 pb-1 relative z-10 shrink-0">
                        <div className="text-center">
                           <div className="w-16 border-t border-black mb-1"></div>
                           <p className="text-[8pt] font-black uppercase">অভিভাবক</p>
                        </div>
                        <div className="text-center">
                           <div className="w-16 border-t border-black mb-1"></div>
                           <p className="text-[8pt] font-black uppercase">নাজিমে তালীমাত</p>
                        </div>
                     </div>
                  </div>
               ))}
               {/* Placeholder for odd numbers */}
               {chunk.length === 1 && <div className="marksheet-card-fixed border-dashed border-slate-200 bg-slate-50/20 flex items-center justify-center no-print"><FileText size={48} className="text-slate-100" /></div>}
            </div>
           ))
         ) : (
           <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-slate-200">
              <GraduationCap size={64} className="mx-auto text-slate-200 mb-6" />
              <h4 className="text-xl font-bold text-slate-400">তথ্য পাওয়া যায়নি।</h4>
           </div>
         )}
      </div>
    </div>
  );
};

export default Marksheet;
