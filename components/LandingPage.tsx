
import React from 'react';
import { Rocket, Star, Code, Play, Sparkles, Zap, Heart, Trophy, Gamepad2 } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex flex-col items-center justify-center text-white relative overflow-hidden font-sans">
      {/* Animated background elements */}
      <div className="absolute top-10 left-10 animate-bounce"><Star size={50} className="text-yellow-300 drop-shadow-glow" /></div>
      <div className="absolute top-20 right-32 animate-pulse animation-delay-300"><Sparkles size={45} className="text-pink-300" /></div>
      <div className="absolute bottom-32 left-20 animate-bounce animation-delay-500"><Zap size={55} className="text-yellow-400 drop-shadow-glow" /></div>
      <div className="absolute bottom-20 right-20 animate-float"><Rocket size={70} className="text-white opacity-90" /></div>
      <div className="absolute top-1/3 left-1/4 animate-spin-slow"><Code size={120} className="text-white opacity-10" /></div>
      <div className="absolute bottom-1/4 right-1/3 animate-bounce animation-delay-700"><Trophy size={60} className="text-yellow-300 opacity-80" /></div>
      <div className="absolute top-1/2 right-10 animate-pulse animation-delay-1000"><Heart size={40} className="text-red-400" /></div>
      <div className="absolute bottom-1/3 left-1/3 animate-float animation-delay-1500"><Gamepad2 size={50} className="text-cyan-300 opacity-70" /></div>
      
      {/* Multiple floating blobs with different colors */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float animation-delay-4000"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>

      {/* Main content card with 3D effect */}
      <div className="z-10 text-center p-12 max-w-4xl backdrop-blur-sm bg-white/10 rounded-[60px] border-4 border-white/30 shadow-2xl transform hover:scale-105 transition-transform duration-500">
        {/* Glowing title */}
        <div className="relative mb-8">
          <h1 className="text-7xl md:text-9xl font-black mb-4 drop-shadow-2xl tracking-tight animate-gradient bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
            CodeQuest
          </h1>
          <div className="flex items-center justify-center gap-4">
            <Sparkles className="text-yellow-300 animate-pulse" size={40} />
            <h2 className="text-5xl md:text-7xl font-black text-yellow-300 drop-shadow-glow animate-bounce-slow">
              Kids
            </h2>
            <Sparkles className="text-pink-300 animate-pulse animation-delay-500" size={40} />
          </div>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border-2 border-white/40 shadow-lg transform hover:scale-110 transition-transform">
            <Code className="text-cyan-300" size={24} />
            <span className="font-black text-lg">学编程</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border-2 border-white/40 shadow-lg transform hover:scale-110 transition-transform animation-delay-200">
            <Zap className="text-yellow-300" size={24} />
            <span className="font-black text-lg">玩游戏</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border-2 border-white/40 shadow-lg transform hover:scale-110 transition-transform animation-delay-400">
            <Trophy className="text-yellow-400" size={24} />
            <span className="font-black text-lg">赢奖励</span>
          </div>
        </div>
        
        <p className="text-2xl md:text-3xl font-bold mb-12 opacity-95 leading-relaxed drop-shadow-lg">
          🎮 专为小朋友设计的编程冒险！<br/>
          🧠 通过趣味游戏学习逻辑思维<br/>
          🚀 探索神奇的数字世界
        </p>
        
        {/* Super cool start button */}
        <button 
          onClick={onStart}
          className="group relative bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-slate-900 px-16 py-8 rounded-full font-black text-3xl shadow-[0_12px_0_rgba(0,0,0,0.3),0_0_30px_rgba(251,191,36,0.5)] hover:shadow-[0_6px_0_rgba(0,0,0,0.3),0_0_50px_rgba(251,191,36,0.8)] hover:translate-y-1.5 active:translate-y-3 active:shadow-[0_2px_0_rgba(0,0,0,0.3)] transition-all flex items-center gap-5 mx-auto border-4 border-white/50 overflow-hidden"
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          
          <Play fill="currentColor" size={40} className="animate-pulse relative z-10" />
          <span className="relative z-10">开始冒险</span>
          <Rocket size={40} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform relative z-10" />
          
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-yellow-300/50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Floating icons around button */}
        <div className="mt-8 flex justify-center gap-8">
          <Star className="text-yellow-300 animate-spin-slow" size={30} />
          <Sparkles className="text-pink-300 animate-bounce" size={30} />
          <Heart className="text-red-400 animate-pulse" size={30} />
          <Zap className="text-cyan-300 animate-bounce animation-delay-300" size={30} />
        </div>
      </div>

      {/* Enhanced footer */}
      <div className="absolute bottom-8 text-white/70 text-base font-bold backdrop-blur-sm bg-white/10 px-8 py-3 rounded-full border-2 border-white/20">
        ✨ 开启智慧之门 · 探索编程乐趣 · 成为小小程序员 ✨
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-white/30 rounded-tl-3xl"></div>
      <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-white/30 rounded-tr-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-white/30 rounded-bl-3xl"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-white/30 rounded-br-3xl"></div>
    </div>
  );
};

export default LandingPage;