
import React from 'react';
import { Heart, Utensils, Bath, Moon } from 'lucide-react';

interface PetHomeProps {
  status: { hunger: number; clean: number; energy: number; mood: string };
  action: string | null;
}

const PetHome: React.FC<PetHomeProps> = ({ status, action }) => {
  return (
    <div className="bg-orange-100/50 p-8 rounded-[40px] shadow-inner aspect-square w-full max-w-[500px] mx-auto flex flex-col items-center justify-center relative border-8 border-white">
      {/* Status Bars */}
      <div className="absolute top-6 left-6 right-6 flex justify-between gap-2">
        <StatusIcon icon={<Utensils size={14} />} value={status.hunger} color="bg-orange-400" label="饱食" />
        <StatusIcon icon={<Bath size={14} />} value={status.clean} color="bg-blue-400" label="清洁" />
        <StatusIcon icon={<Moon size={14} />} value={status.energy} color="bg-purple-400" label="精神" />
      </div>

      {/* The Pet */}
      <div className="relative">
        <div className={`text-9xl transition-all duration-500 transform ${action ? 'scale-125 -translate-y-4' : 'scale-100'}`}>
          {action === 'FEED' ? '😋' : action === 'SLEEP' ? '😴' : action === 'WASH' ? '🧼' : status.mood}
        </div>
        {action && (
          <div className="absolute -top-10 -right-10 animate-bounce">
            <Heart className="text-red-500 fill-red-500" size={40} />
          </div>
        )}
      </div>

      <div className="mt-8 bg-white/80 px-6 py-2 rounded-full font-bold text-orange-600 shadow-sm">
        {action === 'FEED' ? '喵！好香呀~' : 
         action === 'WASH' ? '洗香香啦！' : 
         action === 'SLEEP' ? '呼呼...做个好梦' : 
         action === 'PLAY_BALL' ? '接住这个球！' : '我是你的电子喵~'}
      </div>
    </div>
  );
};

const StatusIcon = ({ icon, value, color, label }: any) => (
  <div className="flex flex-col items-center gap-1 flex-1">
    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">{icon} {label}</div>
    <div className="w-full h-3 bg-white rounded-full overflow-hidden border-2 border-white shadow-sm">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default PetHome;
