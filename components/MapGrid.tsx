
import React from 'react';
import { PlayerState, Direction } from '../types';
import { Bot, Box, Skull } from 'lucide-react';

interface MapGridProps {
  gridSize: number;
  player: PlayerState;
  walls: { x: number; y: number }[];
  enemies: { x: number; y: number }[];
  target: { x: number; y: number };
  isPlayerAlive: boolean;
  className?: string;
}

const MapGrid: React.FC<MapGridProps> = ({ gridSize, player, walls, enemies, target, isPlayerAlive, className }) => {
  const cells = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      cells.push({ x, y });
    }
  }

  const getRotation = (dir: Direction) => {
    switch (dir) {
      case 0: return '0deg';   // Up
      case 1: return '90deg';  // Right
      case 2: return '180deg'; // Down
      case 3: return '-90deg'; // Left
    }
  };

  const isWall = (x: number, y: number) => walls.some(w => w.x === x && w.y === y);
  const isEnemy = (x: number, y: number) => enemies.some(e => e.x === x && e.y === y);

  return (
    <div className={`bg-[#1e293b] p-4 rounded-[40px] shadow-2xl border-8 border-[#334155] aspect-square relative overflow-hidden ${className || 'w-full'}`}>
      <div 
        className="grid gap-1 w-full h-full"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`
        }}
      >
        {cells.map((cell) => {
          const wall = isWall(cell.x, cell.y);
          const enemy = isEnemy(cell.x, cell.y);
          const isTarget = target.x === cell.x && target.y === cell.y;
          
          return (
            <div 
              key={`${cell.x}-${cell.y}`}
              className={`
                relative rounded-xl flex items-center justify-center transition-all duration-300
                ${wall ? 'bg-slate-600 shadow-inner' : 'bg-slate-700/50'}
                ${isTarget ? 'ring-4 ring-yellow-400/30 bg-yellow-400/10' : ''}
              `}
            >
              {!wall && <div className="w-2 h-2 bg-slate-600/30 rounded-full" />}
              {wall && <div className="absolute inset-2 bg-slate-500 rounded-lg border-b-4 border-slate-800" />}
              
              {isTarget && (
                <div className="absolute animate-bounce">
                  <Box className="text-yellow-400 drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]" size={32} strokeWidth={2.5} />
                </div>
              )}

              {enemy && (
                <div className="absolute animate-pulse">
                  <Skull className="text-red-500 drop-shadow-lg" size={32} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isPlayerAlive && (
        <div 
          className="absolute transition-all duration-500 ease-in-out z-20 flex items-center justify-center"
          style={{
            width: `${100 / gridSize}%`,
            height: `${100 / gridSize}%`,
            left: `${(player.x / gridSize) * 100}%`,
            top: `${(player.y / gridSize) * 100}%`,
            padding: '12px'
          }}
        >
          <div 
            className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center shadow-[0_8px_0_#1d4ed8] border-4 border-white relative transition-transform duration-300"
            style={{ transform: `rotate(${getRotation(player.direction)})` }}
          >
             <Bot className="text-white" size={24} />
             <div className="absolute -top-2 w-full flex justify-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapGrid;
