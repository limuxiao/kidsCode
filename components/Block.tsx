
import React from 'react';
import { BlockType, CodeBlock } from '../types';
import { 
  ArrowUp, ArrowDown, RotateCcw, RotateCw, Sword, Trash2, GripVertical,
  Sparkles, Flame, Droplets, RefreshCw, Music, VolumeX, Leaf, Gem
} from 'lucide-react';

interface BlockProps {
  data: CodeBlock;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, data: CodeBlock) => void;
  onRemove?: () => void;
  onValueChange?: (val: number | string) => void;
  index?: number;
  highlight?: boolean;
}

type InputType = 'NUMBER' | 'COLOR' | 'NOTE' | 'NONE';

const CONFIG: Record<BlockType, { label: string; icon: any; color: string; inputType: InputType }> = {
  // Maze
  FORWARD: { label: '前进', icon: ArrowUp, color: 'bg-blue-500 border-blue-700', inputType: 'NUMBER' },
  BACKWARD: { label: '后退', icon: ArrowDown, color: 'bg-cyan-500 border-cyan-700', inputType: 'NUMBER' },
  TURN_LEFT: { label: '左转', icon: RotateCcw, color: 'bg-purple-500 border-purple-700', inputType: 'NONE' },
  TURN_RIGHT: { label: '右转', icon: RotateCw, color: 'bg-pink-500 border-pink-700', inputType: 'NONE' },
  ATTACK: { label: '攻击', icon: Sword, color: 'bg-red-500 border-red-700', inputType: 'NONE' },
  
  // Potion Shop
  ADD_STARDUST: { label: '加星尘', icon: Sparkles, color: 'bg-indigo-500 border-indigo-700', inputType: 'NONE' },
  ADD_FLAME: { label: '加熔岩', icon: Flame, color: 'bg-orange-500 border-orange-700', inputType: 'NONE' },
  ADD_SLIME: { label: '加粘液', icon: Droplets, color: 'bg-lime-500 border-lime-700', inputType: 'NONE' },
  ADD_HERB: { label: '加草药', icon: Leaf, color: 'bg-emerald-500 border-emerald-700', inputType: 'NONE' },
  ADD_CRYSTAL: { label: '加冰晶', icon: Gem, color: 'bg-cyan-400 border-cyan-600', inputType: 'NONE' },
  STIR: { label: '搅拌', icon: RefreshCw, color: 'bg-slate-500 border-slate-700', inputType: 'NONE' },

  // Music
  PLAY_NOTE: { label: '弹奏', icon: Music, color: 'bg-rose-500 border-rose-700', inputType: 'NOTE' },
  REST: { label: '休止', icon: VolumeX, color: 'bg-gray-500 border-gray-700', inputType: 'NONE' },
};

const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

const Block: React.FC<BlockProps> = ({ data, isDraggable, onDragStart, onRemove, onValueChange, highlight }) => {
  const cfg = CONFIG[data.type];
  const Icon = cfg.icon;

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      e.dataTransfer.setData('application/json', JSON.stringify(data));
      e.dataTransfer.effectAllowed = 'copyMove';
      onDragStart(e, data);
    }
  };

  const renderInput = () => {
    if (cfg.inputType === 'NUMBER') {
      return (
        <div className="flex items-center gap-1 bg-black/20 rounded-lg px-1 py-1 flex-shrink-0">
          <input 
            type="number" 
            min="1" 
            value={data.value || 1}
            onChange={(e) => onValueChange && onValueChange(Math.max(1, parseInt(e.target.value) || 1))}
            onMouseDown={(e) => e.stopPropagation()} 
            className="w-12 bg-white text-gray-800 rounded text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      );
    }
    if (cfg.inputType === 'COLOR') {
      return (
        <div className="flex items-center gap-1 bg-black/20 rounded-lg px-1 py-1 flex-shrink-0">
          <input 
            type="color" 
            value={data.value as string || '#000000'}
            onChange={(e) => onValueChange && onValueChange(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()} 
            className="w-8 h-6 bg-white rounded cursor-pointer border-none p-0"
          />
        </div>
      );
    }
    if (cfg.inputType === 'NOTE') {
      return (
        <div className="flex items-center gap-1 bg-black/20 rounded-lg px-1 py-1 flex-shrink-0">
          <select
            value={data.value || 'C4'}
            onChange={(e) => onValueChange && onValueChange(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()} 
            className="w-14 bg-white text-gray-800 rounded text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 py-0.5"
          >
            {NOTES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      draggable={isDraggable}
      onDragStart={handleDragStart}
      className={`
        relative flex items-center gap-2 p-2 rounded-xl shadow-md text-white select-none w-full
        ${cfg.color} border-b-4 transition-all duration-200
        ${highlight ? 'ring-4 ring-yellow-400 scale-105 z-10' : ''}
        ${isDraggable ? 'cursor-grab active:cursor-grabbing hover:-translate-y-1' : ''}
      `}
    >
      {/* Centipede Connectors Visuals */}
      {!isDraggable && (
        <>
           <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-black/20 rounded-b-full opacity-30" />
           <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-white/30 rounded-b-full" />
        </>
      )}

      {isDraggable && <GripVertical size={16} className="opacity-50 flex-shrink-0" />}
      
      <Icon size={18} strokeWidth={3} className="flex-shrink-0" />
      <span className="font-bold text-sm tracking-wide flex-1 truncate">{cfg.label}</span>

      {renderInput()}

      {onRemove && (
        <button 
          onClick={onRemove}
          className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

export default Block;
