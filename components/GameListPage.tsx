
import React from 'react';
import CourseCard from './CourseCard';
import { Map, FlaskConical, Music, Gamepad2, ArrowLeft } from 'lucide-react';
import { Course } from '../types';

interface GameListPageProps {
  onSelectGame: (gameId: string) => void;
  onBack: () => void;
}

const COURSES: Course[] = [
  {
    id: 'maze-adventure',
    title: '迷宫探险',
    description: '使用代码指令帮助机器人走出迷宫，收集宝藏！',
    icon: <Map size={40} className="text-blue-500" />,
    bgColor: 'bg-blue-400'
  },
  {
    id: 'magic-shop', 
    title: '魔法商店',
    description: '为客人调制神奇的药水！学会顺序与配方。',
    icon: <FlaskConical size={40} className="text-purple-500" />,
    bgColor: 'bg-purple-300'
  },
   {
    id: 'music-maker',
    title: '节奏大师',
    description: '编写旋律，创造属于你的动感音乐！',
    icon: <Music size={40} className="text-pink-500" />,
    bgColor: 'bg-pink-300'
  }
];

const GameListPage: React.FC<GameListPageProps> = ({ onSelectGame, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h1 className="text-4xl font-black text-slate-800 mb-2 flex items-center gap-3">
                    <Gamepad2 className="text-purple-500" size={48} />
                    游戏中心
                </h1>
                <p className="text-slate-500 font-medium text-lg">选择一个世界开始你的挑战吧！</p>
            </div>
            <button 
              onClick={onBack} 
              className="group flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold px-6 py-3 rounded-xl hover:bg-slate-200 transition-all"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                返回首页
            </button>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COURSES.map(course => (
            <div key={course.id}>
                <CourseCard 
                  course={course} 
                  onClick={() => onSelectGame(course.id)} 
                />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameListPage;
