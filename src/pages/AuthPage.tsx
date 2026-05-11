import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { LogIn, Github } from 'lucide-react';

export default function AuthPage() {
  const { login } = useAuth();

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center p-8 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="z-10 w-full max-w-sm flex flex-col items-center">
        <motion.div
           initial={{ y: -50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="mb-12 text-center"
        >
          <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mb-6 mx-auto rotate-12 shadow-2xl shadow-red-600/40">
            <LogIn color="white" size={40} className="-rotate-12" />
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter text-white mb-2">IRONFLOW</h1>
          <p className="text-neutral-400 font-medium">Evolution, redefined.</p>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full space-y-4"
        >
          <button 
            onClick={login}
            className="w-full bg-white text-black font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            ENTRAR COM GOOGLE
          </button>
          
          <button 
            className="w-full bg-neutral-900 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 opacity-50 cursor-not-allowed"
          >
            ENTRAR COM APPLE
          </button>

          <p className="text-center text-xs text-neutral-600 mt-8">
            Ao continuar, você concorda com nossos <br/> 
            <span className="underline">Termos de Uso</span> e <span className="underline">Privacidade</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
