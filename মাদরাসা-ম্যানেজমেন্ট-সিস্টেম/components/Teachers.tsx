import React, { useState, useRef } from 'react';
import { 
  Phone, Plus, Edit2, Trash2, 
  User, Camera, X, Save, Briefcase, AlertCircle, CheckCircle2, Upload
} from 'lucide-react';
import { Teacher } from '../types';

interface TeachersProps {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
}

const Teachers: React.FC<TeachersProps> = ({ teachers, setTeachers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<Partial<Teacher> | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toBn = (num: string | number | undefined | null) => {
    if (!num) return '';
    const digits: Record<string, string> = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return String(num).replace(/[0-9]/g, w => digits[w]);
  };

  const openAddModal = () => {
    setCurrentTeacher({
      id: `T${Date.now().toString().slice(-6)}`,
      name: '',
      designation: '',
      department: '',
      phone: '',
      image: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    setIsModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setTeacherToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (teacherToDelete) {
      setTeachers(teachers.filter(t => t.id !== teacherToDelete));
      setIsDeleteModalOpen(false);
      setTeacherToDelete(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentTeacher(prev => prev ? { ...prev, image: reader.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveTeacher = () => {
    if (!currentTeacher?.name || !currentTeacher?.designation) {
      alert('দয়া করে নাম এবং পদবী পূরণ করুন।');
      return;
    }

    if (teachers.find(t => t.id === currentTeacher.id)) {
      setTeachers(teachers.map(t => t.id === currentTeacher.id ? (currentTeacher as Teacher) : t));
    } else {
      setTeachers([...teachers, currentTeacher as Teacher]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">আসসাতিজায়ে কেরাম</h2>
          <p className="text-slate-500 font-medium mt-1">সম্মানিত উস্তাদগণের তালিকা এবং প্রোফাইল ব্যবস্থাপনা।</p>
        </div>
        <button 
          onClick={openAddModal} 
          className="bg-madrasa-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-madrasa-700/20 hover:bg-madrasa-800 transition-all flex items-center gap-2 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> নতুন শিক্ষক যুক্ত করুন
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-madrasa-900/5 transition-all relative group overflow-hidden">
            <div className="flex gap-6 items-center">
              <div className="relative">
                {teacher.image ? (
                  <img src={teacher.image} alt={teacher.name} className="w-24 h-24 rounded-[24px] object-cover ring-4 ring-madrasa-50 shadow-md" />
                ) : (
                  <div className="w-24 h-24 rounded-[24px] bg-madrasa-50 flex items-center justify-center text-madrasa-300 ring-4 ring-madrasa-50">
                    <User size={40} />
                  </div>
                )}
                <div className="absolute -top-2 -right-2 bg-white p-1.5 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-xl leading-tight truncate" title={teacher.name}>{teacher.name}</h3>
                <div className="flex items-center gap-1.5 text-madrasa-700 text-sm font-bold mt-2">
                  <Briefcase size={14} />
                  <span className="truncate">{teacher.designation}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1.5 font-bold">
                  <Phone size={12} />
                  <span>{toBn(teacher.phone)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: {teacher.id}</span>
               <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(teacher)}
                    className="p-2.5 text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                    title="ইডিট করুন"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => confirmDelete(teacher.id)}
                    className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                    title="ডিলিট করুন"
                  >
                    <Trash2 size={18} />
                  </button>
               </div>
            </div>
          </div>
        ))}
        {teachers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
            <User size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">এখনো কোনো শিক্ষকের তথ্য যোগ করা হয়নি।</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">আপনি কি নিশ্চিত?</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">এই সম্মানিত শিক্ষকের সকল তথ্য স্থায়ীভাবে মুছে ফেলা হবে। এই কাজ আর ফিরে পাওয়া যাবে না।</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-4 text-slate-600 font-bold bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
              >
                বাতিল
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-4 text-white font-bold bg-red-500 rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-200"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-8 bg-madrasa-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">{teachers.find(t => t.id === currentTeacher?.id) ? 'তথ্য সংশোধন' : 'নতুন শিক্ষক যুক্ত করুন'}</h3>
                <p className="text-madrasa-400 text-xs font-bold mt-1">সঠিক তথ্য দিয়ে ফরমটি পূরণ করুন</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div className="flex flex-col items-center gap-4">
                <div 
                  className="relative w-32 h-32 rounded-[32px] bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center text-slate-300 overflow-hidden cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {currentTeacher?.image ? (
                    <img src={currentTeacher.image} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <User size={48} />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="text-white" size={24} />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-madrasa-700 text-sm font-bold flex items-center gap-2 hover:bg-madrasa-50 px-4 py-2 rounded-xl transition-all"
                >
                  <Upload size={16} /> ছবি আপলোড করুন
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase ml-2 tracking-wider">শিক্ষকের নাম</label>
                  <input 
                    type="text" 
                    placeholder="নাম লিখুন" 
                    value={currentTeacher?.name || ''} 
                    onChange={(e) => setCurrentTeacher({...currentTeacher, name: e.target.value})} 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-madrasa-500/10 focus:border-madrasa-500 transition-all font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase ml-2 tracking-wider">পদবী</label>
                  <input 
                    type="text" 
                    placeholder="পদবী (যেমন: সিনিয়র শিক্ষক)" 
                    value={currentTeacher?.designation || ''} 
                    onChange={(e) => setCurrentTeacher({...currentTeacher, designation: e.target.value})} 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-madrasa-500/10 focus:border-madrasa-500 transition-all font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase ml-2 tracking-wider">বিভাগ</label>
                  <input 
                    type="text" 
                    placeholder="বিভাগ (যেমন: হাদিস/আদব)" 
                    value={currentTeacher?.department || ''} 
                    onChange={(e) => setCurrentTeacher({...currentTeacher, department: e.target.value})} 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-madrasa-500/10 focus:border-madrasa-500 transition-all font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase ml-2 tracking-wider">ফোন নম্বর</label>
                  <input 
                    type="text" 
                    placeholder="ফোন নম্বর" 
                    value={currentTeacher?.phone || ''} 
                    onChange={(e) => setCurrentTeacher({...currentTeacher, phone: e.target.value})} 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-madrasa-500/10 focus:border-madrasa-500 transition-all font-bold" 
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-t bg-slate-50 flex justify-end gap-4">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-8 py-3.5 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                বাতিল
              </button>
              <button 
                onClick={saveTeacher} 
                className="px-12 py-3.5 bg-madrasa-700 text-white font-bold rounded-2xl hover:bg-madrasa-800 shadow-xl shadow-madrasa-700/20 flex items-center gap-2 transition-all"
              >
                <Save size={20} /> সেভ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;