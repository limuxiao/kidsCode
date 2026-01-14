
import React from 'react';
import { Flag, Shield } from 'lucide-react';

interface CastleBuildProps {
  structures: { type: string; id: string }[];
  isNight: boolean;
  hasDragon: boolean;
}

const CastleBuild: React.FC<CastleBuildProps> = ({ structures, isNight, hasDragon }) => {
  return (
    <div className={`relative p-8 rounded-[50px] shadow-inner aspect-square w-full max-w-[500px] mx-auto overflow-hidden border-8 border-white transition-all duration-1000 ${isNight ? 'bg-indigo-950' : 'bg-amber-100'}`}>
      {/* Ground */}
      <div className={`absolute bottom-0 left-0 right-0 h-24 transition-colors ${isNight ? 'bg-indigo-900' : 'bg-amber-200'}`} />
      
      {/* The Castle */}
      <div className="flex items-end justify-center h-full gap-1 pb-16 relative z-10">
        {structures.map((s, i) => (
          <div 
            key={s.id} 
            className={`transition-all duration-500 transform animate-bounce`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {s.type === 'TOWER' ? (
              <div className="w-16 h-32 bg-gray-400 border-x-4 border-t-8 border-gray-500 rounded-t-lg relative">
                <div className="absolute inset-2 grid grid-cols-2 gap-1">
                  <div className="w-2 h-4 bg-gray-800/20 rounded-sm" />
                  <div className="w-2 h-4 bg-gray-800/20 rounded-sm" />
                </div>
              </div>
            ) : (
              <div className="w-8 h-12 flex items-center justify-center text-blue-500 animate-pulse">
                <Flag fill="currentColor" size={32} />
              </div>
            )}
          </div>
        ))}

        {hasDragon && (
          <div className="absolute -top-10 left-10 text-8xl animate-float">🐉</div>
        )}
      </div>

      {isNight && (
        <div className="absolute top-10 right-10 w-16 h-16 bg-yellow-100 rounded-full shadow-[0_0_50px_rgba(253,224,71,0.5)]" />
      )}
    </div>
  );
};

export default CastleBuild;
