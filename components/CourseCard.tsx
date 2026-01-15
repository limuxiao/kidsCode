
import React from 'react';
import { Course } from '../types';
import { Sparkle, RotateCcw } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onClick: () => void;
  onRestart?: () => void;
  hasProgress?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, onRestart, hasProgress = false }) => {
  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRestart) {
      onRestart();
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`
        group cursor-pointer bg-white rounded-[40px] p-8 shadow-xl 
        hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4
        border-b-[12px] border-gray-100 active:border-b-0 active:translate-y-2
        relative overflow-hidden
      `}
    >
      {/* Decorative background element */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${course.bgColor} rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50`} />
      
      <div className="relative z-10">
        <div className="w-20 h-20 rounded-[25px] bg-gray-50 flex items-center justify-center text-5xl mb-6 shadow-sm group-hover:rotate-12 transition-transform">
          {course.icon}
        </div>
        <h3 className="text-3xl font-black text-gray-800 mb-3 tracking-tight">{course.title}</h3>
        <p className="text-gray-500 font-bold text-sm mb-8 leading-relaxed opacity-80">{course.description}</p>
        
        {hasProgress ? (
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center text-gray-800 font-black gap-2 bg-gray-50 px-4 py-2 rounded-full border-2 border-gray-100 group-hover:bg-yellow-400 group-hover:text-white group-hover:border-yellow-400 transition-all">
              继续魔法 <Sparkle size={18} className="group-hover:animate-spin" />
            </div>
            <button
              onClick={handleRestart}
              className="flex items-center text-gray-500 hover:text-gray-800 font-bold gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full border-2 border-gray-200 transition-all text-sm"
            >
              <RotateCcw size={16} /> 重新开始
            </button>
          </div>
        ) : (
          <div className="flex items-center text-gray-800 font-black gap-2 bg-gray-50 w-fit px-4 py-2 rounded-full border-2 border-gray-100 group-hover:bg-yellow-400 group-hover:text-white group-hover:border-yellow-400 transition-all">
            开始魔法 <Sparkle size={18} className="group-hover:animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;