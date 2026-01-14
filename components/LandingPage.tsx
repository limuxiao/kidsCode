
import React from 'react';
import { Rocket, Star, Code, Play } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="h-screen w-screen bg-gradient-to-b from-blue-400 to-purple-600 flex flex-col items-center justify-center text-white relative overflow-hidden font-sans">
      {/* Background elements */}
      <div className="absolute top-10 left-10 animate-bounce delay-100"><Star size={40} className="text-yellow-300" /></div>
      <div className="absolute bottom-20 right-20 animate-bounce delay-700"><Rocket size={60} className="text-white opacity-80" /></div>
      <div className="absolute top-1/4 right-1/4 animate-pulse"><Code size={100} className="text-white opacity-20" /></div>
      
      {/* Decorative blobs */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-2000"></div>

      <div className="z-10 text-center p-8 max-w-2xl">
        <h1 className="text-6xl md:text-8xl font-black mb-6 drop-shadow-lg tracking-tight">
          CodeQuest <span className="text-yellow-300">Kids</span>
        </h1>
        <p className="text-xl md:text-2xl font-medium mb-12 opacity-90 leading-relaxed">
          专为小朋友设计的编程冒险！<br/>
          通过趣味游戏学习逻辑思维，<br/>
          探索未知的数字世界。
        </p>
        
        <button 
          onClick={onStart}
          className="group relative bg-yellow-400 text-slate-900 px-12 py-6 rounded-full font-black text-2xl shadow-[0_8px_0_rgba(0,0,0,0.2)] hover:shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:translate-y-1 active:translate-y-2 transition-all flex items-center gap-4 mx-auto"
        >
          <Play fill="currentColor" size={32} />
          <span>开始冒险</span>
          <div className="absolute -inset-2 bg-white/30 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-white/50 text-sm font-medium">
        开启智慧之门 · 探索编程乐趣
      </div>
    </div>
  );
};

export default LandingPage;
