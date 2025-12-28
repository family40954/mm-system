
import React, { useState, useRef } from 'react';
import { 
  Download, Upload, Mail, Cloud, Database, 
  RefreshCw, FileJson, ArrowRight, ShieldCheck, MailPlus, CheckCircle2, AlertTriangle, X
} from 'lucide-react';

interface BackupProps {
  globalData: any;
  onRestore: (data: any) => void;
}

const Backup: React.FC<BackupProps> = ({ globalData, onRestore }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeMethod, setActiveMethod] = useState<'download' | 'email' | 'cloud' | null>(null);
  const [targetEmail, setTargetEmail] = useState('');
  
  // Validation States
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [pendingData, setPendingData] = useState<any>(null);
  const [fileName, setFileName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    setIsProcessing(true);
    setActiveMethod('download');
    
    const backupPayload = {
      profile: globalData.profile,
      students: globalData.students,
      teachers: globalData.teachers,
      transactions: globalData.transactions,
      fees: globalData.fees,
      marksData: globalData.marksData,
      subjects: globalData.subjects,
      examTypes: globalData.examTypes,
      classes: globalData.classes,
      sessions: globalData.sessions,
      incomeCategories: globalData.incomeCategories,
      expenseCategories: globalData.expenseCategories,
      version: '2.9.8',
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      try {
        const dataStr = JSON.stringify(backupPayload, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `madrasa_db_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
        setActiveMethod(null);
      }
    }, 600);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setValidationStatus('idle');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawContent = event.target?.result as string;
        const data = JSON.parse(rawContent);
        
        // Strict Validation Check
        if (data && data.profile && Array.isArray(data.students)) {
          setPendingData(data);
          setValidationStatus('valid');
        } else {
          setPendingData(null);
          setValidationStatus('invalid');
        }
      } catch (err) {
        setPendingData(null);
        setValidationStatus('invalid');
      }
    };
    reader.onerror = () => {
      setValidationStatus('invalid');
      setPendingData(null);
    };
    reader.readAsText(file);
  };

  const resetUpload = () => {
    setValidationStatus('idle');
    setPendingData(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeRestore = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pendingData && validationStatus === 'valid') {
      // Direct call to trigger the sync modal in App.tsx
      onRestore(pendingData);
    }
  };

  const handleEmailBackup = () => {
    if (!targetEmail || !targetEmail.includes('@')) {
      alert('দয়া করে একটি সঠিক ইমেইল এড্রেস প্রদান করুন।');
      return;
    }
    setIsProcessing(true);
    setActiveMethod('email');
    setTimeout(() => {
      setIsProcessing(false);
      setActiveMethod(null);
      alert(`${targetEmail} ঠিকানায় ব্যাকআপ ফাইলটি সফলভাবে পাঠানো হয়েছে (সিমুলেটেড)`);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10">
        <div className="w-44 h-44 bg-madrasa-50 text-madrasa-700 rounded-full flex items-center justify-center shrink-0 border-8 border-white shadow-2xl relative overflow-hidden group">
           {isProcessing ? <RefreshCw size={64} className="animate-spin opacity-20" /> : <Database size={64} className="group-hover:scale-110 transition-transform" />}
           <div className="absolute inset-0 bg-madrasa-900/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex-1 text-center md:text-left">
           <h3 className="text-3xl font-black text-slate-800">ডাটা ব্যাকআপ ও সিকিউরিটি</h3>
           <p className="text-slate-500 font-medium mt-3 leading-relaxed text-lg">
             আপনার মাদরাসার শিক্ষার্থী, হিসাব এবং ফলাফলের তথ্যগুলো অত্যন্ত মূল্যবান। নিয়মিত ব্যাকআপ ডাউনলোড করে পিসিতে অথবা ইমেইলে সুরক্ষিত রাখুন।
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-2xl transition-all flex flex-col">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
               <Download size={32} />
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-3">লোকাল ডাউনলোড</h4>
            <p className="text-slate-400 text-sm font-bold mb-8 flex-1">সম্পূর্ণ ডাটাবেজ একটি JSON ফাইল হিসেবে সরাসরি আপনার ডিভাইসে ডাউনলোড করে রাখুন।</p>
            <button 
              type="button"
              disabled={isProcessing}
              onClick={handleDownload}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-transform hover:scale-105"
            >
              {activeMethod === 'download' ? <RefreshCw className="animate-spin" size={18} /> : <FileJson size={18} />}
              ফাইল ডাউনলোড করুন
            </button>
         </div>

         <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-2xl transition-all flex flex-col">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
               <Mail size={32} />
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-3">ইমেইল ব্যাকআপ</h4>
            <input 
              type="email" 
              placeholder="ইমেইল এড্রেস লিখুন..." 
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border rounded-xl mb-4 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button 
              type="button"
              disabled={isProcessing}
              onClick={handleEmailBackup}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-transform hover:scale-105"
            >
              {activeMethod === 'email' ? <RefreshCw className="animate-spin" size={18} /> : <MailPlus size={18} />}
              ইমেইলে ব্যাকআপ পাঠান
            </button>
         </div>

         <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-2xl transition-all flex flex-col">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
               <Cloud size={32} />
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-3">ড্রাইভ সিঙ্ক</h4>
            <p className="text-slate-400 text-sm font-bold mb-8 flex-1">গুগল ড্রাইভ বা ক্লাউড স্টোরেজের সাথে ডাটাবেজ সিঙ্ক করে নিরাপদ রাখুন।</p>
            <button 
              type="button"
              disabled={isProcessing}
              className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg hover:bg-purple-700 flex items-center justify-center gap-2 transition-transform hover:scale-105"
            >
               <RefreshCw size={18} /> ড্রাইভ সিঙ্ক করুন
            </button>
         </div>
      </div>

      <div className="bg-slate-900 p-12 rounded-[56px] text-white space-y-8 shadow-2xl relative overflow-hidden border border-white/10">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Upload size={180} />
         </div>
         
         <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
            <div className="flex items-center gap-8">
               <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center shrink-0 rotate-3 border border-white/20">
                  <Upload size={48} className="text-gold" />
               </div>
               <div>
                  <h4 className="text-3xl font-black text-white">ডাটা ফিরিয়ে আনুন</h4>
                  <p className="text-madrasa-400 font-bold uppercase mt-1 tracking-widest text-sm">ব্যাকআপ ফাইলটি এখানে আপলোড করুন</p>
               </div>
            </div>
            
            {validationStatus === 'idle' ? (
               <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-12 py-6 bg-white text-slate-900 rounded-[32px] font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 text-xl"
               >
                  ফাইল আপলোড করুন <ArrowRight size={24} />
               </button>
            ) : (
               <div className="flex items-center gap-4 animate-in zoom-in-95">
                  <div className={`flex flex-col items-end mr-4`}>
                     <p className="font-bold text-[10px] text-madrasa-400 uppercase tracking-widest mb-1">সিলেক্টেড ফাইল</p>
                     <p className="font-black text-lg text-white truncate max-w-[250px]">{fileName}</p>
                  </div>
                  <button 
                     type="button"
                     onClick={resetUpload}
                     className="p-5 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all"
                     title="বাতিল করুন"
                  >
                     <X size={24} />
                  </button>
                  <button 
                     type="button"
                     onClick={executeRestore}
                     className={`px-12 py-6 rounded-[32px] font-black shadow-2xl transition-all flex items-center gap-4 text-xl relative pointer-events-auto cursor-pointer ${
                        validationStatus === 'valid' 
                        ? 'bg-emerald-500 text-white hover:scale-105 active:scale-95 shadow-emerald-500/40 ring-4 ring-emerald-500/20' 
                        : 'bg-red-500 text-white cursor-not-allowed opacity-80'
                     }`}
                  >
                     {validationStatus === 'valid' ? (
                        <><CheckCircle2 size={28} /> রিস্টোর শুরু করুন</>
                     ) : (
                        <><AlertTriangle size={28} /> ভুল ফাইল ফরমেট</>
                     )}
                  </button>
               </div>
            )}
         </div>
         
         <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept=".json" 
         />
      </div>

      <div className="bg-emerald-50 p-8 rounded-[48px] border border-emerald-100 flex flex-col md:flex-row items-center gap-8 shadow-sm">
         <div className="p-5 bg-white rounded-3xl shadow-md"><ShieldCheck size={36} className="text-emerald-600" /></div>
         <div className="flex-1">
            <h5 className="font-black text-emerald-900 text-lg mb-1">নিরাপদ রিস্টোর গাইড</h5>
            <p className="text-emerald-800 font-bold leading-relaxed text-sm">
              আপনার ফাইলটি সঠিক হলে বাটুনটি <span className="text-emerald-600 underline">সবুজ</span> হবে। সবুজ বাটুনে ক্লিক করার সাথে সাথে একটি প্রোগ্রেস মডাল আসবে। রিস্টোর সম্পন্ন হওয়ার পর অ্যাপটি সরাসরি আপনাকে ড্যাশবোর্ডে নিয়ে যাবে। কোনো ভুল এরর দেখালে সরাসরি মেইন ডোমেইনে রিলোড করুন।
            </p>
         </div>
      </div>
    </div>
  );
};

export default Backup;
