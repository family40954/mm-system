import React, { useMemo } from 'react';
import { 
  Users, GraduationCap, Banknote, ArrowUpRight, 
  TrendingUp, TrendingDown, Wallet, Calendar, 
  Clock, Plus, ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Student, Teacher, Transaction, MadrasaProfile, AppView } from '../types';

interface DashboardProps {
  profile: MadrasaProfile;
  students: Student[];
  teachers: Teacher[];
  transactions: Transaction[];
  setCurrentView: (view: AppView) => void;
}

const StatCard: React.FC<{ 
  icon: React.ReactNode, 
  title: string, 
  value: string | number, 
  subValue?: string, 
  color: string, 
  trend?: { val: string, up: boolean } 
}> = ({ icon, title, value, subValue, color, trend }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
    <div className="flex items-start justify-between">
      <div className={`p-4 rounded-2xl ${color} shadow-sm group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center ${trend.up ? 'text-emerald-500' : 'text-red-500'} text-xs font-bold`}>
          {trend.up ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
          <span>{trend.val}</span>
        </div>
      )}
    </div>
    <div className="mt-5">
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</h3>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>
        {subValue && <span className="text-xs text-slate-400 font-bold">{subValue}</span>}
      </div>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ students, teachers, transactions, setCurrentView, profile }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const thisMonthStr = todayStr.substring(0, 7);
    const thisYearStr = todayStr.substring(0, 4);

    const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);

    const todayIncome = transactions.filter(t => t.type === 'Income' && t.date === todayStr).reduce((acc, t) => acc + t.amount, 0);
    const todayExpense = transactions.filter(t => t.type === 'Expense' && t.date === todayStr).reduce((acc, t) => acc + t.amount, 0);

    const monthIncome = transactions.filter(t => t.type === 'Income' && t.date.startsWith(thisMonthStr)).reduce((acc, t) => acc + t.amount, 0);
    const monthExpense = transactions.filter(t => t.type === 'Expense' && t.date.startsWith(thisMonthStr)).reduce((acc, t) => acc + t.amount, 0);

    const yearIncome = transactions.filter(t => t.type === 'Income' && t.date.startsWith(thisYearStr)).reduce((acc, t) => acc + t.amount, 0);
    const yearExpense = transactions.filter(t => t.type === 'Expense' && t.date.startsWith(thisYearStr)).reduce((acc, t) => acc + t.amount, 0);

    return {
      totalIncome, totalExpense, balance: totalIncome - totalExpense,
      todayIncome, todayExpense,
      monthIncome, monthExpense,
      yearIncome, yearExpense
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    const months = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const currentYear = new Date().getFullYear();
    const data = months.map((name, index) => {
      const monthStr = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
      const income = transactions
        .filter(t => t.type === 'Income' && t.date.startsWith(monthStr))
        .reduce((acc, t) => acc + t.amount, 0);
      const expense = transactions
        .filter(t => t.type === 'Expense' && t.date.startsWith(monthStr))
        .reduce((acc, t) => acc + t.amount, 0);
      return { name, income, expense };
    });
    const currentMonth = new Date().getMonth();
    return data.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
  }, [transactions]);

  const recentStudents = useMemo(() => {
    return [...students].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);
  }, [students]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-madrasa-900 p-8 rounded-[40px] text-white shadow-2xl shadow-madrasa-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <GraduationCap size={180} className="rotate-12" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">স্বাগতম, {profile.name}!</h1>
          <p className="text-madrasa-300 mt-2 font-medium max-w-lg">আজকের ড্যাশবোর্ড আপডেট করা হয়েছে। আপনার মাদরাসার সকল তথ্য এখন একনজরে হাতের কাছে।</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button 
              onClick={() => setCurrentView(AppView.LEARNERS)}
              className="bg-white text-madrasa-900 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gold hover:text-white transition-all shadow-lg"
            >
              <Plus size={20} /> নতুন শিক্ষার্থী
            </button>
            <button 
              onClick={() => setCurrentView(AppView.ACCOUNTING)}
              className="bg-madrasa-700/50 backdrop-blur-md text-white border border-madrasa-500 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-madrasa-700 transition-all"
            >
              <Wallet size={20} /> খরচ রেকর্ড করুন
            </button>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 flex flex-col justify-center min-w-[240px]">
          <p className="text-madrasa-300 text-xs font-bold uppercase tracking-widest mb-2">মোট ক্যাশ ব্যালেন্স</p>
          <h2 className="text-4xl font-bold tracking-tighter">৳ {stats.balance.toLocaleString()}</h2>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-madrasa-400">স্টেটাস: <span className="text-emerald-400 font-bold">সক্রিয়</span></span>
            <Clock size={16} className="text-madrasa-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<GraduationCap className="text-blue-600" size={24} />} 
          title="মোট শিক্ষার্থী" 
          value={students.length} 
          subValue="জন"
          color="bg-blue-50"
          trend={{ val: "সক্রিয়", up: true }}
        />
        <StatCard 
          icon={<Users className="text-emerald-600" size={24} />} 
          title="মোট উস্তাদ" 
          value={teachers.length} 
          subValue="জন"
          color="bg-emerald-50"
        />
        <StatCard 
          icon={<TrendingUp className="text-blue-600" size={24} />} 
          title="আজকের আয়" 
          value={`৳ ${stats.todayIncome.toLocaleString()}`} 
          color="bg-blue-50"
        />
        <StatCard 
          icon={<TrendingDown className="text-red-600" size={24} />} 
          title="আজকের ব্যয়" 
          value={`৳ ${stats.todayExpense.toLocaleString()}`} 
          color="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-bold text-slate-800 text-xl tracking-tight">আর্থিক প্রবাহ চিত্র</h3>
              <p className="text-slate-400 text-xs mt-1">গত ৬ মাসের আয় ও ব্যয়ের তুলনামূলক বিশ্লেষণ</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-madrasa-600 rounded-full" />
                <span className="text-xs font-bold text-slate-600">আয়</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-200 rounded-full" />
                <span className="text-xs font-bold text-slate-600">ব্যয়</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}}
                  itemStyle={{fontWeight: 700}}
                />
                <Area type="monotone" dataKey="income" stroke="#16a34a" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={4} />
                <Area type="monotone" dataKey="expense" stroke="#cbd5e1" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 text-xl tracking-tight">সাম্প্রতিক ভর্তি</h3>
            <button onClick={() => setCurrentView(AppView.LEARNERS)} className="text-madrasa-600 hover:bg-madrasa-50 p-2 rounded-xl transition-colors">
              <ArrowRight size={20} />
            </button>
          </div>
          <div className="space-y-5 flex-1 overflow-y-auto pr-2">
            {recentStudents.map((student) => (
              <div key={student.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl hover:bg-madrasa-50 transition-colors border border-transparent hover:border-madrasa-100 cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-bold text-madrasa-700 shadow-sm group-hover:scale-110 transition-transform">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 truncate">
                  <p className="text-sm font-bold text-slate-800 truncate">{student.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{student.class} | রোল: {student.roll}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setCurrentView(AppView.LEARNERS)}
            className="w-full mt-8 py-4 bg-slate-50 text-slate-600 font-bold hover:bg-madrasa-900 hover:text-white rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            সকল শিক্ষার্থীর তথ্য
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;