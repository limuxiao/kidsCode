
import React, { useState, useEffect } from 'react';
import { Position, LevelConfig } from '../types';
import { Flag, Bot, AlertTriangle } from 'lucide-react';

interface PlaygroundProps {
  level: LevelConfig;
  currentPos: Position;
  isExecuting: boolean;
}

const Playground: React.FC<PlaygroundProps> = ({ level, currentPos, isExecuting }) => {
  const cells = [];
  for (let y = 0; y < level.gridSize; y++) {
    for (let x = 0; x < level.gridSize; x++) {
      cells.push({ x, y });
    }
  }

  const getRotation = (dir: number) => {
    return `rotate(${dir * 90}deg)`;
  };

  const isObstacle = (x: number, y: number) => {
    return level.walls.some(obs => obs.x === x && obs.y === y);
  };

  const isTarget = (x: number, y: number) => {
    return level.targetPos.x === x && level.targetPos.y === y;
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-blue-100 aspect-square max-w-[500px] w-full mx-auto relative overflow-hidden">
      <div 
        className="grid gap-2 h-full w-full" 
        style={{ gridTemplateColumns: `repeat(${level.gridSize}, 1fr)` }}
      >
        {cells.map((cell) => (
          <div 
            key={`${cell.x}-${cell.y}`}
            className={`
              aspect-square rounded-lg flex items-center justify-center transition-colors
              ${isObstacle(cell.x, cell.y) ? 'bg-red-100' : 'bg-blue-50'}
              ${isTarget(cell.x, cell.y) ? 'bg-green-100 ring-4 ring-green-400 ring-inset' : ''}
            `}
          >
            {isObstacle(cell.x, cell.y) && <AlertTriangle className="text-red-500" size={20} />}
            {isTarget(cell.x, cell.y) && <Flag className="text-green-600 animate-bounce" size={24} />}
            
            {currentPos.x === cell.x && currentPos.y === cell.y && (
              <div 
                className="transition-all duration-300 transform"
                style={{ transform: getRotation(currentPos.direction) }}
              >
                <Bot className="text-blue-600 drop-shadow-md" size={40} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playground;
