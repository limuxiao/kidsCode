
import React, { useState, useRef, useEffect } from 'react';
import { askAITutor } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, MessageCircle, X, Sparkles } from 'lucide-react';

interface AITutorProps {
  currentContext: any;
}

const AITutor: React.FC<AITutorProps> = ({ currentContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '你好呀！我是 Codey。在编程冒险中遇到困难了吗？尽管问我哦！✨' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await askAITutor(userMsg, currentContext);
      setMessages(prev => [...prev, { role: 'model', text: response || '哎呀，我也卡住了，能再说一遍吗？' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: '抱歉，我现在连接不上大脑了，请稍后再试。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-3xl shadow-2xl flex flex-col border-4 border-purple-200 overflow-hidden">
          <div className="bg-purple-500 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <span className="font-bold">Codey 导师</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-purple-600 p-1 rounded">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl animate-pulse">Codey 正在思考...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="问问 Codey..."
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-purple-500 text-white p-4 rounded-full shadow-lg hover:bg-purple-600 hover:scale-110 transition-all group flex items-center gap-2"
        >
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            需要帮助吗？
          </span>
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
};

export default AITutor;
