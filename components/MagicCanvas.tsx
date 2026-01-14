
import React, { useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';

interface Trail {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
}

interface MagicCanvasProps {
  robotPos: { x: number; y: number; angle: number };
  trails: Trail[];
  isPenDown: boolean;
}

const MagicCanvas: React.FC<MagicCanvasProps> = ({ robotPos, trails, isPenDown }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid points for guidance
    ctx.fillStyle = '#e5e7eb';
    for(let i=20; i<canvas.width; i+=40) {
      for(let j=20; j<canvas.height; j+=40) {
        ctx.beginPath();
        ctx.arc(i, j, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw trails
    trails.forEach(trail => {
      ctx.beginPath();
      ctx.moveTo(trail.fromX, trail.fromY);
      ctx.lineTo(trail.toX, trail.toY);
      ctx.strokeStyle = trail.color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
    });
  }, [trails]);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-purple-100 aspect-square max-w-[500px] w-full mx-auto relative overflow-hidden flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        className="border border-gray-100 rounded-lg w-full h-full"
      />
      <div 
        className="absolute transition-all duration-300 pointer-events-none"
        style={{ 
          left: `${(robotPos.x / 400) * 100}%`, 
          top: `${(robotPos.y / 400) * 100}%`,
          transform: `translate(-50%, -50%) rotate(${robotPos.angle}deg)`
        }}
      >
        <Bot className={`${isPenDown ? 'text-blue-600' : 'text-gray-400'} drop-shadow-md`} size={40} />
      </div>
    </div>
  );
};

export default MagicCanvas;
