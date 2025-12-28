import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, User, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const AIHelper: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: 'আসসালামু আলাইকুম! আমি আপনার মাদরাসা ম্যানেজমেন্টের এআই অ্যাসিস্ট্যান্ট। আমি আপনাকে লেসন প্ল্যান তৈরি, রিপোর্ট বিশ্লেষণ বা যেকোনো প্রশাসনিক কাজে সাহায্য করতে পারি।' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: 'You are a helpful AI assistant for a Madrasa Management System in Bangladesh. Use Bengali language. Assist with lesson planning, student performance analysis, and administrative suggestions. Keep responses professional, respectful, and rooted in Islamic principles.',
        }
      });

      const aiText = response.text || 'দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না। আবার চেষ্টা করুন।';
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: 'কানেকশন ইরর! অনুগ্রহ করে আপনার ইন্টারনেট কানেকশন চেক করুন।' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
      <div className="p-6 bg-madrasa-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-madrasa-700 p-2 rounded-xl shadow-inner"><Bot size={28} /></div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">মাদরাসা এআই হেল্পার</h2>
            <div className="flex items-center gap-2 text-xs text-madrasa-300">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> অনলাইন অ্যাসিস্ট্যান্ট
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-madrasa-100 text-madrasa-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' ? 'bg-madrasa-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center text-slate-400">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <span className="text-xs font-medium">এআই টাইপ করছে...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="flex gap-4">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="আপনার প্রশ্ন লিখুন..."
            className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-madrasa-500 outline-none shadow-sm transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-madrasa-800 text-white p-4 rounded-2xl hover:bg-madrasa-900 transition-all disabled:opacity-50 shadow-lg"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIHelper;