import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Dumbbell, LogIn } from 'lucide-react';

export default function AuthPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center p-8 overflow-hidden relative">
      {/* Background elements - Brutalist / Impactful */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none" />
      </div>

      <div className="z-10 w-full max-w-sm flex flex-col items-center">
        <motion.div
           initial={{ y: -50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="mb-16 text-center"
        >
          <div className="w-24 h-24 bg-red-600 rounded-[40px] flex items-center justify-center mb-8 mx-auto rotate-12 shadow-[0_20px_80px_rgba(220,38,38,0.4)] relative group">
            <div className="absolute inset-0 bg-white/20 rounded-[40px] animate-pulse" />
            <Dumbbell color="white" size={48} className="-rotate-12 relative z-10" />
          </div>
          <h1 className="text-7xl font-black italic tracking-tighter text-white mb-2 leading-none">IRONFLOW</h1>
          <p className="text-red-500 font-black uppercase tracking-[0.4em] text-[10px]">Forge Your Legacy</p>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full space-y-6"
        >
          <button 
            onClick={onEnter}
            className="w-full bg-red-600 text-white font-black py-6 px-6 rounded-[32px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl shadow-red-600/30 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-xl uppercase italic tracking-widest relative z-10">COMEÇAR</span>
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform relative z-10" />
          </button>
          
          <div className="flex flex-col items-center gap-2 pt-4">
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Disponível em qualquer dispositivo</p>
            <div className="flex gap-4 opacity-30 grayscale">
               <LogIn size={16} className="text-white" />
               <LogIn size={16} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-12 text-center"
        >
           <p className="text-[8px] font-black text-neutral-800 uppercase tracking-[0.5em]">Evolution, Redefined</p>
        </motion.div>
      </div>
    </div>
  );
}
