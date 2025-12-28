
import React, { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';
import { MOCK_STUDENTS } from '../constants';
import { Student } from '../types';

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.includes(searchTerm) || s.id.includes(searchTerm) || s.class.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ছাত্রের নাম বা আইডি দিয়ে খুঁজুন..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-madrasa-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <Filter size={18} />
            <span className="text-sm font-medium">ফিল্টার</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-2 text-white bg-madrasa-600 rounded-xl hover:bg-madrasa-700 transition-all font-bold shadow-lg shadow-madrasa-600/20">
            <Plus size={18} />
            <span>নতুন ছাত্র</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">আইডি ও নাম</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">পিতার নাম</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">জামাত</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">রোল</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">স্ট্যাটাস</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-madrasa-50/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-madrasa-100 flex items-center justify-center text-madrasa-700 font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{student.name}</div>
                        <div className="text-xs text-slate-400">ID: {student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{student.fatherName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{student.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{student.roll}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {student.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={18} /></button>
                      <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Edit2 size={18} /></button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Students;
