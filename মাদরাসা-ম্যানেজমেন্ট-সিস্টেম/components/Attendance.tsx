
import React, { useState } from 'react';
import { 
  Calendar, UserCheck, UserX, Search, CheckCircle2, 
  TrendingUp, Users, CalendarDays, BarChart3
} from 'lucide-react';
import { MOCK_STUDENTS } from '../constants';

const Attendance: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | null>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleAttendance = (id: string, status: 'present' | 'absent') => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.includes(searchTerm) || s.id.includes(searchTerm)
  );

  // Stats calculation
  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const absentCount = Object.values(attendance).filter(v => v === 'absent').length;
  const dailyAvg = MOCK_STUDENTS.length > 0 ? ((presentCount / MOCK_STUDENTS.length) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Attendance Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">আজকের গড় উপস্থিতি</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{presentCount > 0 ? dailyAvg : '০'}%</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${dailyAvg}%` }} 
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400">{presentCount}/{MOCK_STUDENTS.length}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <div className="p-2 bg-blue-50 rounded-xl">
              <BarChart3 size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">মাসিক গড় উপস্থিতি</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">৯২.৪%</p>
          <p className="text-[10px] text-blue-500 font-bold mt-2 flex items-center gap-1">
            <TrendingUp size={12} /> গত মাস থেকে ১.২% বৃদ্ধি
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 text-purple-600 mb-2">
            <div className="p-2 bg-purple-50 rounded-xl">
              <CalendarDays size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">বাৎসরিক গড় উপস্থিতি</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">৮৮.৯%</p>
          <p className="text-[10px] text-slate-400 font-bold mt-2">সেশন: ২০২৪-২৫</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-madrasa-50 p-3 rounded-2xl text-madrasa-700">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">তারিখ নির্বাচন</h3>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="text-sm font-bold text-madrasa-600 bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
            />
          </div>
        </div>
        
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ছাত্রের নাম বা রোল লিখে খুঁজুন..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-madrasa-500 outline-none"
          />
        </div>

        <button className="bg-madrasa-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-madrasa-700/20 hover:bg-madrasa-800 transition-all flex items-center gap-2">
          <CheckCircle2 size={18} /> হাজিরা সংরক্ষণ করুন
        </button>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h4 className="font-bold text-slate-700">শিক্ষার্থী তালিকা</h4>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> উপস্থিত: {presentCount}
            </span>
            <span className="flex items-center gap-1.5 text-red-600">
              <div className="w-2 h-2 rounded-full bg-red-500" /> অনুপস্থিত: {absentCount}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all shadow-sm ${
                  attendance[student.id] === 'present' ? 'bg-emerald-600 text-white' : 
                  attendance[student.id] === 'absent' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {student.roll}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-madrasa-700 transition-colors">{student.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{student.class}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleAttendance(student.id, 'absent')}
                  className={`p-3 rounded-xl transition-all ${attendance[student.id] === 'absent' ? 'bg-red-600 text-white shadow-md' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                  title="অনুপস্থিত"
                >
                  <UserX size={20} />
                </button>
                <button 
                  onClick={() => toggleAttendance(student.id, 'present')}
                  className={`p-3 rounded-xl transition-all ${attendance[student.id] === 'present' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                  title="উপস্থিত"
                >
                  <UserCheck size={20} />
                </button>
              </div>
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <div className="col-span-full bg-white p-20 text-center">
              <p className="text-slate-400 font-medium">কোনো শিক্ষার্থী পাওয়া যায়নি।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
