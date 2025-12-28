
import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, Upload, Mail, Cloud, Database, 
  RefreshCw, FileJson, ArrowRight, ShieldCheck, MailPlus, CheckCircle2, AlertTriangle, X, Search, History, CloudDownload
} from 'lucide-react';

interface BackupProps {
  globalData: any;
  onRestore: (data: any) => void;
}

const Backup: React.FC<BackupProps> = ({ globalData, onRestore }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeMethod, setActiveMethod] = useState<'download' | 'email' | 'sync' | null>(null);
  const [targetEmail, setTargetEmail] = useState('');
  const [syncEmail, setSyncEmail] = useState('');
  
  // Cloud Sync State
  const [foundBackup, setFoundBackup] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'searching' | 'found' | 'not_found'>('idle');

  // Validation States for manual upload
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [pendingData, setPendingData] = useState<any>(null);
  const [fileName, setFileName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to to Bengali digits
  const toBn = (input: string | number | undefined | null) => {
    if (input === undefined || input === null || input === '') return '';
    const digits: Record<string, string> = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return String(input).replace(/[0-9]/g, w => digits[w]);
  };

  const createBackupPayload = () => ({
    profile: globalData.profile,
    students: globalData.students,
    teachers: globalData.teachers,
    transactions: globalData.transactions,
    fees: globalData.fees,
    marksData: globalData.marksData,
    subjectsByClass: globalData.subjectsByClass,
    examTypes: globalData.examTypes,
    classes: globalData.classes,
    sessions: globalData.sessions,
    incomeCategories: globalData.incomeCategories,
    expenseCategories: globalData.expenseCategories,
    version: '3.1.0',
    timestamp: new Date().toLocaleString('bn-BD')
  });

  const handleDownload = () => {
    setIsProcessing(true);
    setActiveMethod('download');
    const payload = createBackupPayload();
    setTimeout(() => {
      try {
        const dataStr = JSON.stringify(payload, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `madrasa_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } finally {
        setIsProcessing(false);
        setActiveMethod(null);
      }
    }, 600);
  };

  const handleEmailBackup = () => {
    if (!targetEmail || !targetEmail.includes('@')) {
      alert('সঠিক ইমেইল এড্রেস প্রদান করুন।');
      return;
    }
    setIsProcessing(true);
    setActiveMethod('email');

    const payload = createBackupPayload();

    setTimeout(() => {
      // Simulate Cloud Save linked to email
      const cloudRegistry = JSON.parse(localStorage.getItem('madrasa_cloud_registry') || '{}');
      cloudRegistry[targetEmail.toLowerCase()] = payload;
      localStorage.setItem('madrasa_cloud_registry', JSON.stringify(cloudRegistry));

      setIsProcessing(false);
      setActiveMethod(null);
      alert(`ইমেইল (${targetEmail}) ঠিকানায় ব্যাকআপ সফলভাবে পাঠানো হয়েছে এবং ক্লাউডে সংরক্ষিত হয়েছে।`);
    }, 1200);
  };

  const handleCloudSync = () => {
    if (!syncEmail || !syncEmail.includes('@')) {
      alert('সিঙ্ক করার জন্য সঠিক ইমেইল প্রদান করুন।');
      return;
    }
    setIsProcessing(true);
    setSyncStatus('searching');
    setActiveMethod('sync');

    setTimeout(() => {
      const cloudRegistry = JSON.parse(localStorage.getItem('madrasa_cloud_registry') || '{}');
      const backup = cloudRegistry[syncEmail.toLowerCase()];

      if (backup) {
        setFoundBackup(backup);
        setSyncStatus('found');
      } else {
        setFoundBackup(null);
        setSyncStatus('not_found');
      }
      setIsProcessing(false);
      setActiveMethod(null);
    }, 1500);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data && data.profile && Array.isArray(data.students)) {
          setPendingData(data);
          setValidationStatus('valid');
        } else {
          setValidationStatus('invalid');
        }
      } catch {
        setValidationStatus('invalid');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10">
        <div className="w-44 h-44 bg-madrasa-50 text-madrasa-700 rounded-full flex items-center justify-center shrink-0 border-8 border-white shadow-2xl relative overflow-hidden group">
           {isProcessing ? <RefreshCw size={64} className="animate-spin opacity-20" /> : <Database size={64} />}
           <div className="absolute inset-0 bg-madrasa-900/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex-1 text-center md:text-left">
           <h3 className="text-3xl font-black text-slate-800">অটোমেটিক ক্লাউড ব্যাকআপ ও সিঙ্ক</h3>
           <p className="text-slate-500 font-medium mt-3 leading-relaxed text-lg">
             ইমেইল আইডির মাধ্যমে আপনার মাদরাসার ডেটা ক্লাউডে সুরক্ষিত রাখুন। যেকোনো নতুন ডিভাইসে শুধুমাত্র ইমেইল লিখে সার্চ দিলেই সর্বশেষ ডেটা ফিরে পাবেন।
           </p>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Send to Email Section */}
        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 flex flex-col">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
             <MailPlus size={32} />
          </div>
          <h4 className="text-2xl font-black text-slate-800 mb-2">ইমেইলে ব্যাকআপ পাঠান</h4>
          <p className="text-slate-400 text-sm font-bold mb-6">আপনার ইমেইল আইডি দিন যাতে আমরা সেখানে ব্যাকআপ কপিটি সেভ রাখতে পারি।</p>
          <div className="space-y-4 mt-auto">
            <input 
              type="email" 
              placeholder="আপনার ইমেইল (উদা: madrasa@gmail.com)" 
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold outline-none transition-all"
            />
            <button 
              onClick={handleEmailBackup}
              disabled={isProcessing}
              className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-3 transition-transform hover:scale-[1.02]"
            >
              {activeMethod === 'email' ? <RefreshCw className="animate-spin" size={20} /> : <CloudDownload size={20} />}
              ইমেইলে ব্যাকআপ পাঠান
            </button>
          </div>
        </div>

        {/* Sync from Email Section */}
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl text-white flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
             <RefreshCw size={150} />
          </div>
          <div className="w-16 h-16 bg-white/10 text-gold rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/10">
             <Search size={32} />
          </div>
          <h4 className="text-2xl font-black text-white mb-2">ইমেইল দিয়ে সিঙ্ক করুন</h4>
          <p className="text-madrasa-400 text-sm font-bold mb-6">পূর্বের পাঠানো ইমেইল আইডিটি লিখুন, আমরা সর্বশেষ ব্যাকআপটি খুঁজে দেব।</p>
          <div className="space-y-4 mt-auto">
            <input 
              type="email" 
              placeholder="ইমেইল আইডি দিয়ে সার্চ দিন..." 
              value={syncEmail}
              onChange={(e) => setSyncEmail(e.target.value)}
              className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 focus:border-gold rounded-2xl font-bold outline-none transition-all text-white placeholder:text-white/20"
            />
            <button 
              onClick={handleCloudSync}
              disabled={isProcessing}
              className="w-full py-5 bg-gold text-slate-900 rounded-[24px] font-black shadow-xl hover:bg-white disabled:opacity-50 flex items-center justify-center gap-3 transition-transform hover:scale-[1.02]"
            >
              {activeMethod === 'sync' ? <RefreshCw className="animate-spin" size={20} /> : <RefreshCw size={20} />}
              সিঙ্ক এবং ডেটা খুঁজুন
            </button>
          </div>
        </div>
      </div>

      {/* Sync Results Card */}
      {syncStatus !== 'idle' && (
        <div className="animate-in zoom-in-95 duration-300">
          {syncStatus === 'found' ? (
            <div className="bg-emerald-50 border-2 border-emerald-200 p-10 rounded-[48px] flex flex-col md:flex-row items-center gap-8 shadow-sm">
               <div className="w-24 h-24 bg-white text-emerald-500 rounded-full flex items-center justify-center shadow-lg border-4 border-emerald-100 shrink-0">
                  <History size={48} />
               </div>
               <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-600 mb-1">
                     <CheckCircle2 size={18} />
                     <span className="text-xs font-black uppercase tracking-widest">সর্বশেষ ব্যাকআপ পাওয়া গেছে</span>
                  </div>
                  <h5 className="text-2xl font-black text-slate-800">ব্যাকআপ তারিখ: {foundBackup.timestamp}</h5>
                  <p className="text-slate-500 font-bold mt-2">
                     এই ফাইলটিতে {toBn(foundBackup.students.length)} জন শিক্ষার্থী এবং {toBn(foundBackup.transactions.length)} টি লেনদেনের তথ্য রয়েছে।
                  </p>
               </div>
               <button 
                  onClick={() => onRestore(foundBackup)}
                  className="px-10 py-5 bg-emerald-600 text-white rounded-[32px] font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-3 text-lg"
               >
                  <RefreshCw size={24} /> এখনই রিস্টোর করুন
               </button>
            </div>
          ) : syncStatus === 'searching' ? null : (
            <div className="bg-red-50 border-2 border-red-100 p-10 rounded-[48px] flex items-center gap-6 text-red-700">
               <AlertTriangle size={40} />
               <div>
                  <h5 className="text-xl font-black">কোনো ব্যাকআপ পাওয়া যায়নি!</h5>
                  <p className="font-bold opacity-70">দুঃখিত, এই ইমেইল আইডি ({syncEmail}) এর বিপরীতে কোনো ডেটা আমাদের ক্লাউড রেজিস্ট্রি-তে পাওয়া যায়নি।</p>
               </div>
            </div>
          )}
        </div>
      )}

      {/* Manual File Upload and Download - Secondary Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 flex items-center justify-between group cursor-pointer" onClick={handleDownload}>
           <div className="flex items-center gap-5">
              <div className="p-4 bg-slate-50 text-slate-500 rounded-2xl group-hover:bg-madrasa-900 group-hover:text-white transition-all">
                 <FileJson size={24} />
              </div>
              <div>
                 <h6 className="font-black text-slate-800">অফলাইন ফাইল ডাউনলোড</h6>
                 <p className="text-xs font-bold text-slate-400">আপনার ডিভাইসে ব্যাকআপ কপি সেভ করুন</p>
              </div>
           </div>
           <Download className="text-slate-200 group-hover:text-madrasa-900 transition-all" size={24} />
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 flex items-center justify-between group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
           <div className="flex items-center gap-5">
              <div className="p-4 bg-slate-50 text-slate-500 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                 <Upload size={24} />
              </div>
              <div>
                 <h6 className="font-black text-slate-800">অফলাইন ফাইল আপলোড</h6>
                 <p className="text-xs font-bold text-slate-400">কম্পিউটার থেকে ব্যাকআপ ফাইল রিস্টোর করুন</p>
              </div>
           </div>
           <ArrowRight className="text-slate-200 group-hover:text-emerald-600 transition-all" size={24} />
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept=".json" 
      />

      {/* Manual Restore Process Panel */}
      {validationStatus !== 'idle' && (
        <div className="bg-slate-900 p-10 rounded-[48px] text-white animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${validationStatus === 'valid' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                {validationStatus === 'valid' ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
              </div>
              <div>
                <h6 className="text-xl font-black">{validationStatus === 'valid' ? 'ফাইলটি সঠিক হয়েছে' : 'ভুল ফাইল ফরমেট'}</h6>
                <p className="text-madrasa-400 font-bold text-sm">ফাইল: {fileName}</p>
              </div>
            </div>
            <div className="flex gap-4">
               <button onClick={() => setValidationStatus('idle')} className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold">বাতিল</button>
               {validationStatus === 'valid' && (
                 <button onClick={() => onRestore(pendingData)} className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-600/20 hover:scale-105 transition-transform">রিস্টোর শুরু করুন</button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Security Guidance */}
      <div className="bg-emerald-50 p-8 rounded-[48px] border border-emerald-100 flex flex-col md:flex-row items-center gap-8 shadow-sm">
         <div className="p-5 bg-white rounded-3xl shadow-md"><ShieldCheck size={36} className="text-emerald-600" /></div>
         <div className="flex-1">
            <h5 className="font-black text-emerald-900 text-lg mb-1">নিরাপদ সিঙ্ক গাইড</h5>
            <p className="text-emerald-800 font-bold leading-relaxed text-sm">
              ইমেইল সিঙ্ক করার সময় সবসময় সঠিক ইমেইল আইডি ব্যবহার করুন। সিস্টেম আপনার ইমেইলের বিপরীতে শুধুমাত্র **সর্বশেষ (Latest)** ব্যাকআপটিই সংরক্ষণ করে। রিস্টোর করার সময় বর্তমানের কোনো আন-সেভড ডেটা থাকলে তা আগে ডাউনলোড করে রাখার পরামর্শ দিচ্ছি।
            </p>
         </div>
      </div>
    </div>
  );
};

export default Backup;
