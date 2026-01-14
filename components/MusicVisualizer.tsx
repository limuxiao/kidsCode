
import React from 'react';
import { Music, Volume2 } from 'lucide-react';

interface MusicVisualizerProps {
  activeNote: string | null;
  isPlaying: boolean;
}

const MusicVisualizer: React.FC<MusicVisualizerProps> = ({ activeNote, isPlaying }) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-pink-100 aspect-square max-w-[500px] w-full mx-auto flex flex-col items-center justify-center relative overflow-hidden">
      <div className={`transition-all duration-300 transform ${isPlaying ? 'scale-110' : 'scale-100'}`}>
        <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-colors ${activeNote ? 'bg-rose-500' : 'bg-gray-100'}`}>
          <Music size={64} className={activeNote ? 'text-white' : 'text-gray-300'} />
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <h3 className="text-2xl font-bold text-gray-800 h-8">
          {activeNote ? `正在播放: ${activeNote}` : '准备好开始创作了吗？'}
        </h3>
      </div>

      <div className="flex gap-1 mt-12 h-16 items-end">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className={`w-4 bg-rose-200 rounded-full transition-all duration-200 ${isPlaying ? 'animate-bounce' : ''}`}
            style={{ 
              height: isPlaying ? `${Math.random() * 100 + 20}%` : '20%',
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      {isPlaying && (
        <div className="absolute top-4 right-4 text-rose-500 animate-pulse">
          <Volume2 size={32} />
        </div>
      )}
    </div>
  );
};

export default MusicVisualizer;
