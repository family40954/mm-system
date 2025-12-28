import React, { useState, useMemo } from 'react';
import { 
  Printer, TrendingUp, TrendingDown, Wallet, Plus, 
  Search, Trash2, Calendar, FileText, LayoutGrid, 
  X, Save, CheckCircle2, AlertCircle, GraduationCap,
  ArrowUpCircle, ArrowDownCircle, PieChart, Settings2
} from 'lucide-react';
import { Transaction, MadrasaProfile } from '../types';

interface AccountingProps {
  profile: MadrasaProfile;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  sessions: string[];
  incomeCategories: string[];
  setIncomeCategories: React.Dispatch<React.SetStateAction<string[]>>;
  expenseCategories: string[];
  setExpenseCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const Accounting: React.FC<AccountingProps> = ({ 
  profile, 
  transactions, 
  setTransactions, 
  sessions,
  incomeCategories,
  setIncomeCategories,
  expenseCategories,
  setExpenseCategories
}) => {
  const [activeTab, setActiveTab] = useState<'entry' | 'history' | 'reports' | 'categories'>('entry');
  
  // Modals for Transaction deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<string | null>(null);

  // Modals for Category deletion
  const [isCatDeleteModalOpen, setIsCatDeleteModalOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState<{name: string, type: 'Income' | 'Expense'} | null>(null);

  // Category addition state
  const [newCatName, setNewCatName] = useState('');
  const [catTypeToManage, setCatTypeToManage] = useState<'Income' | 'Expense'>('Income');

  // Filter States
  const [filterPeriod, setFilterPeriod] = useState<'Monthly' | 'Yearly' | 'All'>('Monthly');
  const [searchTerm, setSearchTerm] = useState('');

  // New Transaction Form State
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: 'Income',
    category: incomeCategories[0] || 'অন্যান্য',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const toBn = (input: string | number | undefined | null) => {
    if (input === undefined || input === null || input === '') return '';
    const digits: Record<string, string> = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return String(input).replace(/[0-9]/g, w => digits[w]);
  };

  const handleAddTx = () => {
    if (!newTx.amount || !newTx.category) {
      alert('দয়া করে বিবরণ এবং টাকার পরিমাণ সঠিকভাবে দিন।');
      return;
    }

    const transaction: Transaction = {
      id: `TX-${Date.now()}`,
      type: newTx.type as 'Income' | 'Expense',
      category: newTx.category || '',
      amount: Number(newTx.amount),
      date: newTx.date || '',
      note: newTx.note || '',
      jammat: newTx.jammat
    };

    setTransactions([transaction, ...transactions]);
    setNewTx({ ...newTx, amount: 0, note: '' });
    setActiveTab('history');
  };

  const triggerDelete = (id: string) => {
    setTxToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (txToDelete) {
      setTransactions(transactions.filter(t => t.id !== txToDelete));
      setIsDeleteModalOpen(false);
      setTxToDelete(null);
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    if (catTypeToManage === 'Income') {
      if (!incomeCategories.includes(newCatName)) setIncomeCategories([...incomeCategories, newCatName]);
    } else {
      if (!expenseCategories.includes(newCatName)) setExpenseCategories([...expenseCategories, newCatName]);
    }
    setNewCatName('');
  };

  const triggerCatDelete = (name: string, type: 'Income' | 'Expense') => {
    setCatToDelete({ name, type });
    setIsCatDeleteModalOpen(true);
  };

  const confirmCatDelete = () => {
    if (catToDelete) {
      if (catToDelete.type === 'Income') {
        setIncomeCategories(incomeCategories.filter(c => c !== catToDelete.name));
      } else {
        setExpenseCategories(expenseCategories.filter(c => c !== catToDelete.name));
      }
      setIsCatDeleteModalOpen(false);
      setCatToDelete(null);
    }
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const txDate = new Date(t.date);
      const matchesSearch = t.category.includes(searchTerm) || t.note.includes(searchTerm);
      const matchesPeriod = 
        filterPeriod === 'All' ? true :
        filterPeriod === 'Monthly' ? (txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()) :
        (txDate.getFullYear() === now.getFullYear());
      
      return matchesSearch && matchesPeriod;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterPeriod, searchTerm]);

  const summary = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  const MadrasaHeader = ({ title }: { title: string }) => (
    <div className="text-center mb-10 border-b-4 border-double border-slate-900 pb-8">
      <div className="flex justify-center items-center gap-8">
        {profile.logo ? (
          <img src={profile.logo} className="w-24 h-24 object-contain" alt="Logo" />
        ) : (
          <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-white"><GraduationCap size={48} /></div>
        )}
        <div className="text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-2">{profile.name}</h1>
          <p className="text-lg font-bold text-slate-600">{profile.address}</p>
          <p className="text-md font-bold text-slate-500 mt-1">মোবাইল: {toBn(profile.phone)}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <span className="bg-slate-900 text-white px-10 py-2 rounded-full font-black text-xl tracking-widest uppercase">
          {title}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Navigation Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 no-print bg-white p-4 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-200">
          <button onClick={() => setActiveTab('entry')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'entry' ? 'bg-white shadow-md text-madrasa-900' : 'text-slate-500'}`}><Plus size={18} /> এন্ট্রি</button>
          <button onClick={() => setActiveTab('history')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white shadow-md text-madrasa-900' : 'text-slate-500'}`}><Calendar size={18} /> ইতিহাস</button>
          <button onClick={() => setActiveTab('reports')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'reports' ? 'bg-white shadow-md text-madrasa-900' : 'text-slate-500'}`}><PieChart size={18} /> রিপোর্ট</button>
          <button onClick={() => setActiveTab('categories')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'categories' ? 'bg-white shadow-md text-madrasa-900' : 'text-slate-500'}`}><Settings2 size={18} /> খাতসমূহ</button>
        </div>
        {activeTab === 'reports' && (
          <button onClick={() => window.print()} className="px-8 py-3 bg-madrasa-900 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"><Printer size={20} /> প্রিন্ট করুন</button>
        )}
      </div>

      {activeTab === 'entry' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print animate-in slide-in-from-bottom-4">
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col justify-center h-full">
              <h3 className="text-xl font-black text-slate-800 mb-8 border-b pb-4">আজকের সামারি</h3>
              <div className="space-y-4">
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <ArrowUpCircle className="text-emerald-500" size={32} />
                      <span className="font-bold text-slate-600">মোট আয়</span>
                   </div>
                   <span className="text-2xl font-black text-emerald-700">৳ {toBn(summary.income.toLocaleString())}</span>
                </div>
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <ArrowDownCircle className="text-red-500" size={32} />
                      <span className="font-bold text-slate-600">মোট ব্যয়</span>
                   </div>
                   <span className="text-2xl font-black text-red-700">৳ {toBn(summary.expense.toLocaleString())}</span>
                </div>
                <div className="bg-madrasa-900 p-8 rounded-[32px] text-white flex justify-between items-center shadow-2xl shadow-madrasa-900/20">
                   <div className="flex items-center gap-4">
                      <Wallet className="text-madrasa-300" size={32} />
                      <span className="font-bold">ক্যাশ ব্যালেন্স</span>
                   </div>
                   <span className="text-3xl font-black">৳ {toBn(summary.balance.toLocaleString())}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 space-y-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 border-b pb-4">আয়-ব্যয় এন্ট্রি</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="flex bg-slate-100 p-1.5 rounded-[24px]">
                <button 
                  onClick={() => setNewTx({ ...newTx, type: 'Income', category: incomeCategories[0] })}
                  className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${newTx.type === 'Income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                >
                  <ArrowUpCircle size={20} /> আয় (Income)
                </button>
                <button 
                  onClick={() => setNewTx({ ...newTx, type: 'Expense', category: expenseCategories[0] })}
                  className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${newTx.type === 'Expense' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}
                >
                  <ArrowDownCircle size={20} /> ব্যয় (Expense)
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">বিবরণ/খাত</label>
                <select 
                  value={newTx.category}
                  onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 rounded-3xl font-bold outline-none ring-1 ring-slate-200 focus:ring-4 focus:ring-madrasa-500/10"
                >
                  {(newTx.type === 'Income' ? incomeCategories : expenseCategories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  {(newTx.type === 'Income' ? incomeCategories : expenseCategories).length === 0 && <option value="অন্যান্য">খাত নির্বাচন করুন</option>}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">টাকার পরিমাণ</label>
                  <input 
                    type="number" 
                    placeholder="00"
                    value={newTx.amount || ''}
                    onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                    className="w-full px-6 py-4 bg-slate-50 rounded-3xl font-black text-xl text-madrasa-800 outline-none ring-1 ring-slate-200 focus:ring-4 focus:ring-madrasa-500/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">তারিখ</label>
                  <input 
                    type="date" 
                    value={newTx.date}
                    onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 rounded-3xl font-bold outline-none ring-1 ring-slate-200 focus:ring-4 focus:ring-madrasa-500/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">অতিরিক্ত নোট (ঐচ্ছিক)</label>
                <textarea 
                  placeholder="লেনদেনের কোনো বিশেষ নোট..."
                  value={newTx.note}
                  onChange={(e) => setNewTx({ ...newTx, note: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 rounded-3xl font-bold outline-none ring-1 ring-slate-200 focus:ring-4 focus:ring-madrasa-500/10"
                  rows={2}
                />
              </div>

              <button 
                onClick={handleAddTx}
                className="w-full py-5 bg-madrasa-900 text-white rounded-[32px] font-black text-xl shadow-2xl shadow-madrasa-900/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
              >
                <Save size={24} /> লেনদেন সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden no-print animate-in fade-in">
           <div className="p-8 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex gap-2">
                 {['Monthly', 'Yearly', 'All'].map(period => (
                   <button 
                    key={period} 
                    onClick={() => setFilterPeriod(period as any)}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${filterPeriod === period ? 'bg-madrasa-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}
                   >
                     {period === 'Monthly' ? 'এই মাস' : period === 'Yearly' ? 'এই বছর' : 'সব'}
                   </button>
                 ))}
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="খাত বা নোট দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none"
                />
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">তারিখ</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">বিবরণ ও নোট</th>
                    <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">ধরণ</th>
                    <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">পরিমাণ</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6 font-bold text-slate-500 text-sm whitespace-nowrap">{toBn(t.date)}</td>
                      <td className="px-6 py-6">
                        <div className="font-black text-slate-800 text-base">{t.category}</div>
                        {t.note && <div className="text-[11px] text-slate-400 mt-1 font-bold italic">{t.note}</div>}
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${t.type === 'Income' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                          {t.type === 'Income' ? 'আয়' : 'ব্যয়'}
                        </span>
                      </td>
                      <td className={`px-6 py-6 text-right font-black text-xl ${t.type === 'Income' ? 'text-emerald-700' : 'text-red-600'}`}>
                        {t.type === 'Income' ? '+' : '-'} ৳ {toBn(t.amount.toLocaleString())}
                      </td>
                      <td className="px-8 py-6 text-center">
                         <button 
                          onClick={() => triggerDelete(t.id)}
                          className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                         ><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print animate-in zoom-in-95 duration-300">
           <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100">
              <div className="flex bg-slate-100 p-1.5 rounded-[24px] mb-8">
                <button 
                  onClick={() => setCatTypeToManage('Income')}
                  className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${catTypeToManage === 'Income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                >
                  <ArrowUpCircle size={20} /> আয়ের খাত
                </button>
                <button 
                  onClick={() => setCatTypeToManage('Expense')}
                  className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${catTypeToManage === 'Expense' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}
                >
                  <ArrowDownCircle size={20} /> ব্যয়ের খাত
                </button>
              </div>

              <div className="flex gap-3 mb-8">
                 <input 
                  type="text" 
                  placeholder="নতুন খাতের নাম..." 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-6 py-4 bg-slate-50 border rounded-2xl outline-none font-bold"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                 />
                 <button onClick={handleAddCategory} className="p-4 bg-madrasa-900 text-white rounded-2xl hover:bg-black transition-all">
                    <Plus size={24} />
                 </button>
              </div>

              <div className="space-y-3">
                 {(catTypeToManage === 'Income' ? incomeCategories : expenseCategories).map((cat) => (
                   <div key={cat} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group border border-slate-100">
                      <span className="font-bold text-slate-700 text-lg">{cat}</span>
                      <button 
                        onClick={() => triggerCatDelete(cat, catTypeToManage)}
                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                   </div>
                 ))}
                 {(catTypeToManage === 'Income' ? incomeCategories : expenseCategories).length === 0 && (
                   <p className="text-center py-10 text-slate-400 font-bold italic">কোনো খাত যুক্ত করা নেই।</p>
                 )}
              </div>
           </div>
           
           <div className="bg-slate-900 p-10 rounded-[48px] text-white flex flex-col justify-center items-center text-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
                 <Settings2 size={48} className="text-madrasa-300" />
              </div>
              <h3 className="text-2xl font-black mb-4">খাত ব্যবস্থাপনা কেন প্রয়োজন?</h3>
              <p className="text-madrasa-300 leading-relaxed font-medium">
                 মাদরাসার নিয়মিত আয়ের উৎস এবং ব্যয়ের খাতগুলো আলাদাভাবে এন্ট্রি থাকলে রিপোর্টিং এবং অডিটে সুবিধা হয়। আপনার নিজের মাদরাসার জন্য প্রযোজ্য খাতগুলো এখান থেকে তৈরি করে নিন।
              </p>
           </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-8 animate-in zoom-in-95">
          <div className="printable-area bg-white p-16 rounded-[60px] border shadow-sm">
            <MadrasaHeader title={`মাদরাসার পূর্ণাঙ্গ আয়-ব্যয় রিপোর্ট - ${filterPeriod === 'Monthly' ? 'মাসিক' : filterPeriod === 'Yearly' ? 'বাৎসরিক' : 'সর্বকালীন'}`} />
            
            <div className="grid grid-cols-3 gap-8 mb-12">
               <div className="p-8 bg-slate-50 rounded-[32px] border-2 border-black text-center">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">মোট আয়</p>
                  <p className="text-3xl font-black text-emerald-700">৳ {toBn(summary.income.toLocaleString())}</p>
               </div>
               <div className="p-8 bg-slate-50 rounded-[32px] border-2 border-black text-center">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">মোট ব্যয়</p>
                  <p className="text-3xl font-black text-red-600">৳ {toBn(summary.expense.toLocaleString())}</p>
               </div>
               <div className="p-8 bg-slate-900 rounded-[32px] text-white text-center">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">নীট ব্যালেন্স</p>
                  <p className="text-3xl font-black">৳ {toBn(summary.balance.toLocaleString())}</p>
               </div>
            </div>

            <table className="w-full border-collapse border-4 border-black text-center">
              <thead>
                <tr className="bg-slate-100 border-b-4 border-black">
                  <th className="px-6 py-5 border-r-2 border-black font-black text-lg">তারিখ</th>
                  <th className="px-6 py-5 border-r-2 border-black text-left font-black text-lg">আয়/ব্যয়ের খাত</th>
                  <th className="px-6 py-5 border-r-2 border-black font-black text-lg">ধরণ</th>
                  <th className="px-6 py-5 font-black text-lg">পরিমাণ (টাকা)</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 border-b-4 border-black">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="border-b-2 border-black">
                    <td className="px-6 py-5 border-r-2 border-black font-bold text-lg">{toBn(t.date)}</td>
                    <td className="px-6 py-5 border-r-2 border-black font-black text-xl text-left">
                      {t.category}
                      {t.note && <p className="text-xs font-bold text-slate-500 mt-1">{t.note}</p>}
                    </td>
                    <td className="px-6 py-5 border-r-2 border-black font-bold text-lg">{t.type === 'Income' ? 'আয়' : 'ব্যয়'}</td>
                    <td className="px-6 py-5 font-black text-2xl">৳ {toBn(t.amount.toLocaleString())}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-black">
                 <tr>
                   <td colSpan={3} className="px-8 py-8 text-right text-2xl tracking-widest uppercase border-r-2 border-white/20">সর্বমোট জমা (Cash in Hand):</td>
                   <td className="px-8 py-8 text-right text-4xl font-black">৳ {toBn(summary.balance.toLocaleString())}/-</td>
                 </tr>
              </tfoot>
            </table>

            <div className="print-only hidden pt-32 grid grid-cols-2 gap-20 text-center">
                <div className="border-t-2 border-black pt-4 font-black text-xl">হিসাব রক্ষক / ক্যাশিয়ার</div>
                <div className="border-t-2 border-black pt-4 font-black text-xl">মুহতামীম / প্রিন্সিপাল</div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">লেনদেন মুছবেন?</h3>
            <p className="text-slate-500 text-sm mb-8">আপনি কি নিশ্চিত যে এই লেনদেনের রেকর্ডটি মুছে ফেলতে চান? এটি পুনরায় ফিরে পাওয়া সম্ভব নয়।</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all">বাতিল</button>
              <button onClick={confirmDelete} className="flex-1 py-3 text-white font-bold bg-red-500 rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-200">হ্যাঁ, ডিলিট করুন</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Delete Modal */}
      {isCatDeleteModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">খাত মুছবেন?</h3>
            <p className="text-slate-500 text-sm mb-8">"{catToDelete?.name}" খাতটি মুছে ফেললে ভবিষ্যতে এন্ট্রি দেওয়ার সময় এটি আর তালিকায় পাওয়া যাবে না। আপনি কি নিশ্চিত?</p>
            <div className="flex gap-3">
              <button onClick={() => setIsCatDeleteModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all">বাতিল</button>
              <button onClick={confirmCatDelete} className="flex-1 py-3 text-white font-bold bg-red-500 rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-200">হ্যাঁ, ডিলিট করুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;