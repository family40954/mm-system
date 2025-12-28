
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Menu, X, User, GraduationCap, RefreshCw, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { AppView, Student, Teacher, Fee, MadrasaProfile, Transaction } from './types';
import { NAV_ITEMS, MOCK_STUDENTS, MOCK_TEACHERS, MOCK_FEES, MOCK_CLASSES, MOCK_SESSIONS, MOCK_TRANSACTIONS } from './constants';
import Dashboard from './components/Dashboard';
import Learners from './components/Learners';
import Teachers from './components/Teachers';
import Fees from './components/Fees';
import Results from './components/Results';
import Accounting from './components/Accounting';
import AIHelper from './components/AIHelper';
import Settings from './components/Settings';
import Backup from './components/Backup';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const toBn = (input: string | number | undefined | null) => {
    if (input === undefined || input === null || input === '') return '';
    const digits: Record<string, string> = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return String(input).replace(/[0-9]/g, w => digits[w]);
  };

  // --- Global States ---
  const [profile, setProfile] = useState<MadrasaProfile>(() => {
    const saved = localStorage.getItem('madrasa_profile');
    return saved ? JSON.parse(saved) : {
      name: 'জামিয়া ইসলামিয়া দারুল উলুম',
      address: 'উত্তরা, ঢাকা - ১২৩০',
      establishedYear: '১৯৯৫',
      logo: '',
      phone: '০১৭১১-০০০০০০',
      adminPassword: 'admin123',
      expiryDate: '2026-01-20' // Default expiry date
    };
  });

  const isExpired = useMemo(() => {
    if (!profile.expiryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(profile.expiryDate);
    return today > expiry;
  }, [profile.expiryDate]);

  // Effect to redirect if expired
  useEffect(() => {
    if (isExpired && currentView !== AppView.SETTINGS) {
      setCurrentView(AppView.SETTINGS);
    }
  }, [isExpired, currentView]);

  const [classes, setClasses] = useState<string[]>(() => {
    const saved = localStorage.getItem('madrasa_classes');
    return saved ? JSON.parse(saved) : MOCK_CLASSES;
  });

  const [sessions, setSessions] = useState<string[]>(() => {
    const saved = localStorage.getItem('madrasa_sessions');
    return saved ? JSON.parse(saved) : MOCK_SESSIONS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('madrasa_students');
    return saved ? JSON.parse(saved) : MOCK_STUDENTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('madrasa_teachers');
    return saved ? JSON.parse(saved) : MOCK_TEACHERS;
  });

  const [fees, setFees] = useState<Fee[]>(() => {
    const saved = localStorage.getItem('madrasa_fees');
    return saved ? JSON.parse(saved) : MOCK_FEES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('madrasa_transactions');
    return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
  });

  const [incomeCategories, setIncomeCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('madrasa_income_cats');
    return saved ? JSON.parse(saved) : ['মাসিক কালেকশন', 'দান/সদকা', 'ভর্তি ফি', 'পরীক্ষা ফি', 'বোর্ড ফি', 'অন্যান্য'];
  });

  const [expenseCategories, setExpenseCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('madrasa_expense_cats');
    return saved ? JSON.parse(saved) : ['উস্তাদের বেতন', 'বিদ্যুৎ বিল', 'খাবার খরচ', 'মেরামত কাজ', 'স্টেশনারি', 'অন্যান্য'];
  });

  const [marksData, setMarksData] = useState<Record<string, Record<string, number | string>>>(() => {
    const saved = localStorage.getItem('madrasa_marks_data');
    return saved ? JSON.parse(saved) : {};
  });

  const [subjectsByClass, setSubjectsByClass] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('madrasa_subjects_by_class');
    if (saved) return JSON.parse(saved);
    const initialMap: Record<string, string[]> = {};
    MOCK_CLASSES.forEach(c => {
      initialMap[c] = ['কুরআন', 'হাদিস', 'ফিকহ', 'আরবি', 'বাংলা', 'ইংরেজি', 'গণিত'];
    });
    return initialMap;
  });

  const [examTypes, setExamTypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('madrasa_exam_types');
    return saved ? JSON.parse(saved) : ['১ম সাময়িক', '২য় সাময়িক', 'বার্ষিক পরীক্ষা'];
  });

  // --- Auto-Save ---
  useEffect(() => {
    const isLocked = localStorage.getItem('madrasa_restore_lock') === 'true';
    if (!isSyncing && !isLocked) {
      localStorage.setItem('madrasa_classes', JSON.stringify(classes));
      localStorage.setItem('madrasa_sessions', JSON.stringify(sessions));
      localStorage.setItem('madrasa_profile', JSON.stringify(profile));
      localStorage.setItem('madrasa_students', JSON.stringify(students));
      localStorage.setItem('madrasa_teachers', JSON.stringify(teachers));
      localStorage.setItem('madrasa_fees', JSON.stringify(fees));
      localStorage.setItem('madrasa_transactions', JSON.stringify(transactions));
      localStorage.setItem('madrasa_income_cats', JSON.stringify(incomeCategories));
      localStorage.setItem('madrasa_expense_cats', JSON.stringify(expenseCategories));
      localStorage.setItem('madrasa_marks_data', JSON.stringify(marksData));
      localStorage.setItem('madrasa_subjects_by_class', JSON.stringify(subjectsByClass));
      localStorage.setItem('madrasa_exam_types', JSON.stringify(examTypes));
    }
  }, [classes, sessions, profile, students, teachers, fees, transactions, incomeCategories, expenseCategories, marksData, subjectsByClass, examTypes, isSyncing]);

  const handleGlobalRestore = useCallback((allData: any) => {
    if (!allData) return;
    setIsSyncing(true);
    setSyncProgress(0);
    localStorage.setItem('madrasa_restore_lock', 'true');
    let current = 0;
    const interval = setInterval(() => {
      current += 5;
      if (current > 100) current = 100;
      setSyncProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        try {
          const keysToClean = [
            'madrasa_classes', 'madrasa_sessions', 'madrasa_profile', 'madrasa_students', 
            'madrasa_teachers', 'madrasa_fees', 'madrasa_transactions', 'madrasa_income_cats', 
            'madrasa_expense_cats', 'madrasa_marks_data', 'madrasa_subjects_by_class', 'madrasa_exam_types'
          ];
          keysToClean.forEach(k => localStorage.removeItem(k));
          localStorage.setItem('madrasa_classes', JSON.stringify(allData.classes || []));
          localStorage.setItem('madrasa_sessions', JSON.stringify(allData.sessions || []));
          localStorage.setItem('madrasa_profile', JSON.stringify(allData.profile || {}));
          localStorage.setItem('madrasa_students', JSON.stringify(allData.students || []));
          localStorage.setItem('madrasa_teachers', JSON.stringify(allData.teachers || []));
          localStorage.setItem('madrasa_fees', JSON.stringify(allData.fees || []));
          localStorage.setItem('madrasa_transactions', JSON.stringify(allData.transactions || []));
          localStorage.setItem('madrasa_income_cats', JSON.stringify(allData.incomeCategories || []));
          localStorage.setItem('madrasa_expense_cats', JSON.stringify(allData.expenseCategories || []));
          localStorage.setItem('madrasa_marks_data', JSON.stringify(allData.marksData || {}));
          localStorage.setItem('madrasa_subjects_by_class', JSON.stringify(allData.subjectsByClass || {}));
          localStorage.setItem('madrasa_exam_types', JSON.stringify(allData.examTypes || []));
          setTimeout(() => {
            localStorage.removeItem('madrasa_restore_lock');
            window.location.replace('/');
          }, 800);
        } catch (e) {
          localStorage.removeItem('madrasa_restore_lock');
          setIsSyncing(false);
          alert('তথ্য রিস্টোর করতে সমস্যা হয়েছে।');
        }
      }
    }, 20);
  }, []);

  const handleNavClick = (view: AppView) => {
    if (isExpired && view !== AppView.SETTINGS) {
      alert(`আপনার সিস্টেমের মেয়াদ ${toBn(profile.expiryDate)} তারিখে শেষ হয়েছে। অনুগ্রহ করে সেটিংস থেকে মেয়াদ বৃদ্ধি করুন।`);
      return;
    }
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    const commonProps = { profile, students, teachers, transactions, fees, marksData, examTypes, classes, sessions };
    
    // Safety check: if expired and not in settings, don't render other components
    if (isExpired && currentView !== AppView.SETTINGS) {
      return <Settings profile={profile} setProfile={setProfile} globalData={{...commonProps, incomeCategories, expenseCategories, subjectsByClass}} onRestore={handleGlobalRestore} />;
    }

    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard {...commonProps} setCurrentView={handleNavClick} />;
      case AppView.LEARNERS: return <Learners {...commonProps} setStudents={setStudents} setClasses={setClasses} setSessions={setSessions} />;
      case AppView.TEACHERS: return <Teachers teachers={teachers} setTeachers={setTeachers} />;
      case AppView.FEES: return <Fees fees={fees} setFees={setFees} students={students} profile={profile} classes={classes} sessions={sessions} />;
      case AppView.RESULTS: return <Results {...commonProps} setMarksData={setMarksData} subjectsByClass={subjectsByClass} setSubjectsByClass={setSubjectsByClass} setExamTypes={setExamTypes} />;
      case AppView.ACCOUNTING: return (
        <Accounting 
          profile={profile} 
          transactions={transactions} 
          setTransactions={setTransactions} 
          sessions={sessions} 
          incomeCategories={incomeCategories}
          setIncomeCategories={setIncomeCategories}
          expenseCategories={expenseCategories}
          setExpenseCategories={setExpenseCategories}
        />
      );
      case AppView.AI_HELPER: return <AIHelper />;
      case AppView.SETTINGS: return <Settings profile={profile} setProfile={setProfile} globalData={{...commonProps, incomeCategories, expenseCategories, subjectsByClass}} onRestore={handleGlobalRestore} />;
      case AppView.BACKUP: return <Backup globalData={{...commonProps, incomeCategories, expenseCategories, subjectsByClass}} onRestore={handleGlobalRestore} />;
      default: return <Dashboard {...commonProps} setCurrentView={handleNavClick} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-bengali bg-slate-50">
      {isSyncing && (
        <div className="fixed inset-0 z-[2000] bg-madrasa-950/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-white p-14 rounded-[64px] shadow-[0_64px_160px_rgba(0,0,0,0.6)] flex flex-col items-center gap-10 text-center animate-in zoom-in-95 max-w-sm w-full border border-white/20">
            <div className="relative w-44 h-44 flex items-center justify-center">
               <svg className="w-full h-full -rotate-90">
                 <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-100" />
                 <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray={502.6} strokeDashoffset={502.6 - (502.6 * syncProgress) / 100} className="text-madrasa-600 transition-all duration-300 stroke-round" />
               </svg>
               <div className="absolute flex flex-col items-center">
                 <span className="text-5xl font-black text-slate-800 tracking-tighter">{syncProgress}%</span>
                 <span className="text-[10px] font-black text-madrasa-500 tracking-[0.2em] uppercase mt-1">Applying</span>
               </div>
            </div>
            <div className="space-y-3">
               <h4 className="font-black text-slate-900 text-3xl">{syncProgress < 100 ? 'ডাটা সিঙ্ক হচ্ছে' : 'সফল হয়েছে!'}</h4>
            </div>
            {syncProgress === 100 && (
              <div className="text-emerald-500 animate-in zoom-in duration-500 scale-125">
                <CheckCircle2 size={64} />
              </div>
            )}
          </div>
        </div>
      )}
      <header className="md:hidden bg-madrasa-900 text-white p-4 flex justify-between items-center shadow-xl sticky top-0 z-50 no-print">
        <div className="flex items-center gap-2">
          {profile.logo ? <img src={profile.logo} className="w-8 h-8 rounded bg-white p-0.5" alt="Logo" /> : <div className="bg-white p-1 rounded-lg"><GraduationCap className="text-madrasa-900" size={24} /></div>}
          <h1 className="text-lg font-bold truncate max-w-[200px]">{profile.name}</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg">
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-madrasa-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 no-print ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-madrasa-800 flex flex-col`}>
        <div className="p-8 flex items-center gap-4">
          <div className="bg-white p-2 rounded-2xl shadow-lg rotate-3 shrink-0">
            {profile.logo ? <img src={profile.logo} className="w-10 h-10 object-contain" alt="Logo" /> : <GraduationCap className="text-madrasa-900" size={32} />}
          </div>
          <div><span className="text-sm font-bold block leading-tight truncate w-32">{profile.name}</span><span className="text-[10px] text-madrasa-400 font-medium tracking-widest uppercase">Admin Panel</span></div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const isItemLocked = isExpired && item.id !== AppView.SETTINGS;
            return (
              <button 
                key={item.id} 
                onClick={() => handleNavClick(item.id)} 
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  currentView === item.id 
                  ? 'bg-madrasa-800 text-white shadow-lg border-l-4 border-gold scale-105' 
                  : isItemLocked 
                    ? 'text-madrasa-700 opacity-50 cursor-not-allowed' 
                    : 'text-madrasa-300 hover:bg-madrasa-800/50 hover:text-white'
                }`}
              >
                <span className={currentView === item.id ? 'text-gold' : 'text-madrasa-400'}>
                  {isItemLocked ? <Lock size={20} /> : item.icon}
                </span>
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
        {isExpired && (
          <div className="m-4 p-4 bg-red-900/50 border border-red-500/50 rounded-2xl">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <AlertTriangle size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">মেয়াদ শেষ</span>
            </div>
            <p className="text-[11px] text-white/70 font-bold leading-tight">
              সিস্টেম ভ্যালিডিটি {toBn(profile.expiryDate)} তারিখে শেষ হয়েছে।
            </p>
          </div>
        )}
        <div className="p-6 border-t border-madrasa-800 mt-auto text-center">
            <span className="text-[10px] text-madrasa-500 font-bold uppercase tracking-widest">Madrasa OS v3.1.0 | Managed</span>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="hidden md:flex bg-white border-b border-slate-200 px-8 py-5 items-center justify-between sticky top-0 z-30 shadow-sm no-print">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">{NAV_ITEMS.find(i => i.id === currentView)?.label}</h2>
            {isExpired && <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-200 animate-pulse">মেয়াদ উত্তীর্ণ</span>}
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right"><p className="text-sm font-bold text-slate-800">এডমিন প্যানেল</p><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">নাজেম-এ-আলা</p></div>
              <div className="w-11 h-11 rounded-2xl bg-madrasa-100 border-2 border-white shadow-sm flex items-center justify-center text-madrasa-700"><User size={24} /></div>
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8 flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-[1400px] mx-auto">{renderContent()}</div>
        </div>
      </main>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default App;
