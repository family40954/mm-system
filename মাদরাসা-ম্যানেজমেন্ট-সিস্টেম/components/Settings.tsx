
import React, { useState, useRef } from 'react';
import { 
  Save, Building2, Lock, Upload, Image, 
  MapPin, Phone, Calendar, ShieldCheck, X
} from 'lucide-react';
import { MadrasaProfile } from '../types';

interface SettingsProps {
  profile: MadrasaProfile;
  setProfile: React.Dispatch<React.SetStateAction<MadrasaProfile>>;
  globalData: any;
  onRestore: (data: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, setProfile }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessPassword, setAccessPassword] = useState('');
  const [tempProfile, setTempProfile] = useState<MadrasaProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessPassword === profile.adminPassword) {
      setIsAuthorized(true);
    } else {
      alert('ভুল পাসওয়ার্ড!');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setProfile(tempProfile);
    alert('মাদরাসা প্রোফাইল সফলভাবে আপডেট হয়েছে!');
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-20 animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded-[40px] shadow-2xl border p-12 text-center">
          <div className="w-20 h-20 bg-madrasa-50 text-madrasa-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">সেটিংস লক করা</h2>
          <p className="text-slate-400 text-sm font-bold mb-10 uppercase tracking-widest">এডমিন পাসওয়ার্ড দিয়ে আনলক করুন</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="password" 
              value={accessPassword} 
              onChange={(e) => setAccessPassword(e.target.value)} 
              placeholder="পাসওয়ার্ড লিখুন" 
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-madrasa-500 rounded-2xl text-center font-black outline-none transition-all" 
              autoFocus
            />
            <button type="submit" className="w-full py-4 bg-madrasa-900 text-white rounded-2xl font-black shadow-xl shadow-madrasa-900/20 hover:scale-105 transition-transform flex items-center justify-center gap-2">
              <ShieldCheck size={20} /> আনলক করুন
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-10 border-b flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-black text-slate-800">মাদরাসা প্রোফাইল সেটিংস</h3>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">আপনার মাদরাসার বিস্তারিত তথ্য প্রদান করুন</p>
          </div>
          <button 
            onClick={handleSave} 
            className="bg-madrasa-900 text-white px-10 py-4 rounded-[24px] font-black shadow-xl shadow-madrasa-900/20 hover:scale-105 transition-transform flex items-center gap-3"
          >
            <Save size={20} /> তথ্য সেভ করুন
          </button>
        </div>

        <div className="p-10 space-y-10">
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div 
                className="w-32 h-32 bg-slate-100 rounded-[40px] border-4 border-white shadow-xl flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {tempProfile.logo ? (
                  <img src={tempProfile.logo} className="w-full h-full object-contain" alt="Logo" />
                ) : (
                  <Image size={48} className="text-slate-300" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="text-white" size={24} />
                </div>
              </div>
              {tempProfile.logo && (
                <button 
                  onClick={() => setTempProfile({...tempProfile, logo: ''})}
                  className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="text-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-madrasa-50 text-madrasa-700 font-bold rounded-xl hover:bg-madrasa-100 transition-colors flex items-center gap-2"
              >
                <Upload size={16} /> মাদরাসার লগো আপলোড করুন
              </button>
              <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">পিএনজি অথবা জেপিইজি (৫০০ কেবি সর্বোচ্চ)</p>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-3 tracking-widest flex items-center gap-2">
                <Building2 size={12} /> মাদরাসার নাম
              </label>
              <input 
                type="text" 
                value={tempProfile.name} 
                onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})} 
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-madrasa-500 rounded-2xl font-bold outline-none transition-all" 
                placeholder="মাদরাসার নাম লিখুন"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-3 tracking-widest flex items-center gap-2">
                <Calendar size={12} /> স্থাপিত কাল
              </label>
              <input 
                type="text" 
                value={tempProfile.establishedYear} 
                onChange={(e) => setTempProfile({...tempProfile, establishedYear: e.target.value})} 
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-madrasa-500 rounded-2xl font-bold outline-none transition-all" 
                placeholder="স্থাপিত (উদা: ১৯৯৫)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-3 tracking-widest flex items-center gap-2">
                <Phone size={12} /> ফোন নম্বর
              </label>
              <input 
                type="text" 
                value={tempProfile.phone} 
                onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})} 
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-madrasa-500 rounded-2xl font-bold outline-none transition-all" 
                placeholder="০১৭১১-০০০০০০"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-3 tracking-widest flex items-center gap-2">
                <Lock size={12} /> এডমিন পাসওয়ার্ড
              </label>
              <input 
                type="password" 
                value={tempProfile.adminPassword} 
                onChange={(e) => setTempProfile({...tempProfile, adminPassword: e.target.value})} 
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-madrasa-500 rounded-2xl font-black outline-none transition-all" 
                placeholder="পাসওয়ার্ড পরিবর্তন করুন"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-3 tracking-widest flex items-center gap-2">
                <MapPin size={12} /> মাদরাসার ঠিকানা
              </label>
              <textarea 
                value={tempProfile.address} 
                onChange={(e) => setTempProfile({...tempProfile, address: e.target.value})} 
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-madrasa-500 rounded-2xl font-bold outline-none transition-all" 
                rows={3} 
                placeholder="ঠিকানা লিখুন..."
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-madrasa-900 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-madrasa-900/20">
         <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center shrink-0">
            <ShieldCheck size={40} className="text-gold" />
         </div>
         <div className="flex-1 text-center md:text-left">
            <h4 className="text-xl font-black">নিরাপত্তা সতর্কতা</h4>
            <p className="text-madrasa-300 font-medium leading-relaxed mt-2">
              মাদরাসার ডাটাবেজ এবং সেটিংস প্যানেল অত্যন্ত সংবেদনশীল। পাসওয়ার্ড পরিবর্তন করলে তা অবশ্যই নিরাপদ স্থানে লিখে রাখবেন। নিয়মিত বিরতিতে ডাটা ব্যাকআপ মেনু থেকে তথ্য সংরক্ষণ করুন।
            </p>
         </div>
      </div>
    </div>
  );
};

export default Settings;
