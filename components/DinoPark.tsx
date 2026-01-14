
import React from 'react';
import { CloudRain, Sun, Stars, Zap } from 'lucide-react';

interface DinoParkProps {
  dinos: { type: string; state: string }[];
  weather: 'SUNNY' | 'METEOR';
  isExecuting: boolean;
}

const DinoPark: React.FC<DinoParkProps> = ({ dinos, weather, isExecuting }) => {
  return (
    <div className={`relative bg-emerald-100/50 p-8 rounded-[50px] shadow-inner aspect-square w-full max-w-[500px] mx-auto overflow-hidden border-8 border-white transition-colors duration-1000 ${weather === 'METEOR' ? 'bg-slate-900' : ''}`}>
      {/* Background Decor */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-emerald-200/50 rounded-t-full -mb-10" />
      
      {/* Weather Effects */}
      {weather === 'METEOR' && (
        <div className="absolute inset-0 z-0">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-16 bg-gradient-to-b from-orange-500 to-transparent animate-bounce opacity-70"
              style={{ left: `${i * 15}%`, top: `-${Math.random() * 100}%`, animationDuration: '0.5s', animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}

      {/* Dinos */}
      <div className="flex flex-wrap items-center justify-center gap-8 h-full relative z-10">
        {dinos.length === 0 ? (
          <div className="text-center opacity-30">
            <div className="text-8xl mb-4">🥚</div>
            <p className="font-bold text-emerald-800">还没有恐龙，快孵化一个！</p>
          </div>
        ) : (
          dinos.map((dino, i) => (
            <div 
              key={i} 
              className={`text-9xl transition-all duration-500 transform 
                ${dino.state === 'DANCING' ? 'animate-bounce' : ''}
                ${dino.state === 'ROARING' ? 'scale-125 -rotate-12' : 'scale-100'}
              `}
            >
              {dino.type === 'REX' ? '🦖' : '🦕'}
              {dino.state === 'ROARING' && (
                <div className="absolute -top-4 -right-4 text-4xl animate-ping">🔥</div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="absolute top-6 right-6 flex gap-2">
        {weather === 'METEOR' ? <Zap className="text-yellow-400" /> : <Sun className="text-orange-400" />}
      </div>
    </div>
  );
};

export default DinoPark;
