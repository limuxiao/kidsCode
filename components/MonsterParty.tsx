
import React from 'react';

interface MonsterPartyProps {
  color: string;
  eyeCount: number;
  size: number;
  isDancing: boolean;
}

const MonsterParty: React.FC<MonsterPartyProps> = ({ color, eyeCount, size, isDancing }) => {
  return (
    <div className="bg-purple-100/50 p-8 rounded-[40px] shadow-inner aspect-square w-full max-w-[500px] mx-auto flex flex-col items-center justify-center relative border-8 border-white">
      <div 
        className={`relative transition-all duration-500 transform ${isDancing ? 'animate-bounce' : ''}`}
        style={{ 
          width: `${120 * size}px`, 
          height: `${120 * size}px`,
          backgroundColor: color,
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          boxShadow: 'inset -10px -10px 0 rgba(0,0,0,0.1)'
        }}
      >
        {/* Eyes */}
        <div className="absolute top-1/4 left-0 right-0 flex justify-center gap-2">
          {[...Array(eyeCount)].map((_, i) => (
            <div key={i} className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-gray-800">
              <div className="w-3 h-3 bg-gray-900 rounded-full animate-pulse" />
            </div>
          ))}
        </div>

        {/* Mouth */}
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-10 h-4 bg-gray-800 rounded-full" />
      </div>

      <div className="mt-12 flex gap-4">
        <div className={`w-8 h-2 bg-gray-200 rounded-full ${isDancing ? 'animate-ping' : ''}`} />
        <div className={`w-8 h-2 bg-gray-200 rounded-full ${isDancing ? 'animate-ping delay-100' : ''}`} />
      </div>
      
      <p className="mt-6 font-bold text-purple-600">小怪兽的舞步：{isDancing ? '旋转跳跃！' : '准备中...'}</p>
    </div>
  );
};

export default MonsterParty;
