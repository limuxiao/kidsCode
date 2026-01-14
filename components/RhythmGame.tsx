
import React, { useState, useEffect, useRef } from 'react';
import { BlockType, CodeBlock, MusicLevelConfig } from '../types';
import { MUSIC_LEVELS } from '../utils/gameLevels';
import Block from './Block';
import { Play, RefreshCw, Trophy, AlertTriangle, ArrowRight, Music as MusicIcon, ArrowLeft, Volume2 } from 'lucide-react';

interface RhythmGameProps {
  onBack: () => void;
}

const NOTE_FREQUENCIES: Record<string, number> = {
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
  'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25
};

const RhythmGame: React.FC<RhythmGameProps> = ({ onBack }) => {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [level, setLevel] = useState<MusicLevelConfig>(MUSIC_LEVELS[0]);
  const [program, setProgram] = useState<CodeBlock[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  const [executingIndex, setExecutingIndex] = useState<number | null>(null);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lvl = MUSIC_LEVELS.find(l => l.id === currentLevelId) || MUSIC_LEVELS[0];
    setLevel(lvl);
    setProgram([]);
    setGameState('IDLE');
  }, [currentLevelId]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
    }
  };

  const playTone = (note: string, duration: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const t = ctx.currentTime;
    const freq = NOTE_FREQUENCIES[note];
    
    if (!freq) return;

    // Use Triangle wave + Lowpass Filter + Envelope to simulate piano

    // Oscillator
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    // Filter (makes sound mellower over time)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 8, t); // Start bright
    filter.frequency.exponentialRampToValueAtTime(freq, t + duration * 0.8); // Become duller

    // Gain (Envelope for volume)
    const gainNode = ctx.createGain();
    
    // Connect: Osc -> Filter -> Gain -> Destination
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Envelope Settings (ADSR-like)
    // Instant silence
    gainNode.gain.setValueAtTime(0, t);
    // Fast Attack
    gainNode.gain.linearRampToValueAtTime(0.5, t + 0.02); 
    // Decay/Release
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.start(t);
    osc.stop(t + duration);
  };

  const playDemo = async () => {
    initAudio();
    if (gameState === 'PLAYING') return;
    setGameState('PLAYING');
    
    for (const item of level.targetMelody) {
      setActiveNote(item.note);
      playTone(item.note, 0.5);
      await new Promise(r => setTimeout(r, 600));
    }
    setActiveNote(null);
    setGameState('IDLE');
  };

  const runCode = async () => {
    initAudio();
    if (gameState === 'PLAYING') return;
    setGameState('PLAYING');
    setExecutingIndex(null);

    let correct = true;
    
    // Check length first? No, let's just check sequence match
    if (program.length !== level.targetMelody.length) correct = false;

    for (let i = 0; i < program.length; i++) {
      setExecutingIndex(i);
      const cmd = program[i];
      
      if (cmd.type === 'PLAY_NOTE') {
        const note = cmd.value as string;
        setActiveNote(note);
        playTone(note, 0.5);
        
        // Validation check in real-time or after? 
        // Let's check after, but we can visually show error if we want.
      } else {
        setActiveNote('REST');
        await new Promise(r => setTimeout(r, 500));
      }
      
      await new Promise(r => setTimeout(r, 600));
    }

    setActiveNote(null);
    setExecutingIndex(null);

    // Verify
    if (program.length !== level.targetMelody.length) {
      correct = false;
    } else {
      for(let i=0; i<program.length; i++) {
        if (program[i].type === 'PLAY_NOTE' && program[i].value !== level.targetMelody[i].note) correct = false;
        // Simple logic: Rest handling implies skipping note check? For now just simple match.
      }
    }

    setGameState(correct ? 'WON' : 'LOST');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('blockType') as BlockType;
    if (type) {
        setProgram(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            type,
            value: type === 'PLAY_NOTE' ? 'C4' : undefined
        }]);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col p-4 font-sans overflow-hidden">
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Toolbox & Code */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 h-full">
            <div className="bg-slate-800 p-4 rounded-3xl border-4 border-slate-700 shadow-xl flex justify-between items-center">
             <div className="flex items-center gap-3">
               <button onClick={onBack} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-xl text-slate-300">
                  <ArrowLeft size={20} />
               </button>
               <h1 className="text-xl font-black text-white flex items-center gap-2">
                 <MusicIcon className="text-pink-400" /> 第 {level.id} 关
               </h1>
             </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-3xl border-4 border-slate-700 shadow-xl shrink-0">
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">工具箱</h3>
             <div className="grid grid-cols-2 gap-2">
                {level.availableBlocks.map(type => (
                <Block 
                    key={type} 
                    data={{ id: 'temp', type, value: 'C4' }} 
                    isDraggable={true} 
                    onDragStart={(e, d) => e.dataTransfer.setData('blockType', d.type)} 
                />
                ))}
             </div>
          </div>

          <div 
             onDrop={handleDrop}
             onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
             className="flex-1 bg-slate-800/50 p-4 rounded-3xl border-4 border-dashed border-slate-700/50 flex flex-col relative overflow-hidden"
          >
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">编曲区</h3>
             <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar">
                {program.length === 0 && <div className="text-slate-600 text-center mt-10">拖动音符到这里</div>}
                {program.map((block, idx) => (
                    <Block 
                        key={block.id} 
                        data={block} 
                        onRemove={() => setProgram(p => p.filter(b => b.id !== block.id))}
                        onValueChange={(v) => setProgram(p => p.map(b => b.id === block.id ? { ...b, value: v } : b))}
                        highlight={executingIndex === idx}
                    />
                ))}
             </div>
             <div className="mt-2 pt-2 border-t border-slate-700">
               <button onClick={runCode} disabled={gameState === 'PLAYING'} className="w-full py-3 rounded-2xl font-black text-lg flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-400 text-white shadow-[0_4px_0_#be185d]">
                 {gameState === 'PLAYING' ? <RefreshCw className="animate-spin" /> : <Play fill="currentColor" />}
                 {gameState === 'PLAYING' ? '演奏中...' : '播放旋律'}
               </button>
             </div>
          </div>
        </div>

        {/* Visualizer Area */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 h-full">
            <div className="flex-1 bg-slate-800 rounded-[40px] border-8 border-slate-700 shadow-2xl flex flex-col items-center justify-center relative p-8">
                
                {/* Demo Button */}
                <button onClick={playDemo} className="absolute top-6 right-6 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold">
                    <Volume2 size={18} /> 听听目标旋律
                </button>

                {/* Visualization */}
                <div className="flex gap-2 items-end h-40 mb-10">
                    {['C4','D4','E4','F4','G4','A4','B4','C5'].map(note => (
                        <div key={note} className="flex flex-col items-center gap-2">
                             <div 
                                className={`w-12 rounded-t-xl transition-all duration-200 ${activeNote === note ? 'bg-pink-400 h-32' : 'bg-slate-600 h-16'}`}
                             />
                             <span className="text-slate-400 font-bold">{note}</span>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">{level.title}</h3>
                    <p className="text-slate-400">{level.description}</p>
                </div>

                {/* Overlays */}
                {(gameState === 'WON' || gameState === 'LOST') && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm z-50 rounded-[32px]">
                        {gameState === 'WON' ? <Trophy size={80} className="text-yellow-400 mb-4 animate-bounce" /> : <AlertTriangle size={80} className="text-red-500 mb-4" />}
                        <h2 className="text-4xl font-black text-white mb-4">{gameState === 'WON' ? '旋律正确！' : '听起来不太对哦'}</h2>
                        <div className="flex gap-4">
                            {gameState === 'LOST' ? (
                                <button onClick={() => setGameState('IDLE')} className="bg-white px-8 py-3 rounded-xl font-bold text-xl">再试一次</button>
                            ) : (
                                <button onClick={() => setCurrentLevelId(prev => prev < MUSIC_LEVELS.length ? prev + 1 : 1)} className="bg-yellow-400 px-8 py-3 rounded-xl font-bold text-xl">下一关</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default RhythmGame;
