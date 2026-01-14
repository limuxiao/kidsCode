
import React from 'react';
import { Rocket, Star, ShieldAlert } from 'lucide-react';

interface SpaceExplorerProps {
  rocketPos: { x: number; y: number };
  stars: { x: number; y: number; collected: boolean }[];
  shield: boolean;
  isMoving: boolean;
}

const SpaceExplorer: React.FC<SpaceExplorerProps> = ({ rocketPos, stars, shield, isMoving }) => {
  return (
    <div className="bg-[#0f172a] p-6 rounded-[40px] shadow-2xl aspect-square w-full max-w-[500px] mx-auto relative overflow-hidden border-8 border-gray-800">
      {/* Background Stars */}
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="absolute bg-white rounded-full animate-pulse" 
          style={{ 
            width: Math.random() * 3, 
            height: Math.random() * 3, 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`
          }} 
        />
      ))}

      {/* Target Stars to Collect */}
      {stars.map((star, i) => !star.collected && (
        <div 
          key={i} 
          className="absolute text-yellow-300 animate-spin transition-all duration-500"
          style={{ left: `${star.x}%`, top: `${star.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <Star size={32} fill="currentColor" />
        </div>
      ))}

      {/* The Rocket */}
      <div 
        className="absolute transition-all duration-500 flex flex-col items-center"
        style={{ left: `${rocketPos.x}%`, top: `${rocketPos.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        {shield && (
          <div className="absolute w-24 h-24 rounded-full border-4 border-blue-400/50 bg-blue-400/10 animate-ping" />
        )}
        <Rocket className={`text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] ${isMoving ? 'animate-bounce' : ''}`} size={48} />
        <div className="w-1 h-8 bg-gradient-to-t from-transparent to-orange-500 animate-pulse mt-1" />
      </div>
    </div>
  );
};

export default SpaceExplorer;
