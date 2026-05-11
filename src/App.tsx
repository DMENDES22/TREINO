import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Dumbbell, TrendingUp, Library, User, PlusCircle, Search, Play, Menu, X, ChevronRight, History } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Pages
import Dashboard from './pages/Dashboard';
import ExerciseLibrary from './pages/ExerciseLibrary';
import WorkoutPlans from './pages/WorkoutPlans';
import WorkoutHistory from './pages/WorkoutHistory';
import ProfileSettings from './pages/ProfileSettings';
import AuthPage from './pages/AuthPage';
import ActiveWorkout from './pages/ActiveWorkout';
import CustomExerciseCreator from './components/CustomExerciseCreator';

import { Workout } from './types';

type Tab = 'home' | 'workouts' | 'exercises' | 'evolution' | 'profile';

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 ${active ? 'text-red-500 scale-110' : 'text-neutral-500'}`}
  >
    <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-red-600/10' : ''}`}>
      {icon}
    </div>
    <span className={`text-[8px] font-black mt-1 uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
  </button>
);

const MainApp = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isTraining, setIsTraining] = useState<Workout | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 bg-red-600 rounded-[40px] mb-8 shadow-2xl shadow-red-600/30 flex items-center justify-center"
        >
          <Dumbbell className="text-white" size={40} />
        </motion.div>
        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">IRONFLOW</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 mt-2">Forge Your Power</p>
      </div>
    );
  }

  if (!user) return <AuthPage />;
  if (!profile) return <ProfileSettings isInitialSetup={true} />;
  if (isTraining) return <ActiveWorkout plan={isTraining} onFinish={() => setIsTraining(null)} />;

  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home size={22} /> },
    { id: 'workouts', label: 'Meus Treinos', icon: <Play size={22} /> },
    { id: 'exercises', label: 'Biblioteca', icon: <Library size={22} /> },
    { id: 'evolution', label: 'Evolução', icon: <TrendingUp size={22} /> },
    { id: 'profile', label: 'Perfil', icon: <User size={22} /> },
  ];

  const handleTabChange = (id: string) => {
    setActiveTab(id as Tab);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white max-w-md mx-auto relative overflow-hidden font-sans">
      {/* Mobile Safe Area Guard */}
      <div className="h-safe-top" />

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-neutral-950 border-r border-neutral-800 z-[70] p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
               <div>
                  <h2 className="text-2xl font-black text-red-600 italic tracking-tighter leading-none mb-1">IRONFLOW</h2>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-600 text-left">IRON MENU</p>
               </div>
               <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-400">
                  <X size={20} />
               </button>
            </div>

            <nav className="space-y-2 flex-1">
               {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-red-600 text-white font-black italic shadow-lg shadow-red-600/20' : 'text-neutral-500 hover:text-white font-bold'}`}
                  >
                    <div className="flex items-center gap-4">
                       {item.icon}
                       <span className="text-sm uppercase tracking-widest">{item.label}</span>
                    </div>
                    {activeTab === item.id && <ChevronRight size={16} />}
                  </button>
               ))}
            </nav>

            <div className="pt-8 border-t border-neutral-900">
               <p className="text-[10px] font-black text-neutral-700 uppercase tracking-widest mb-2">Power Status</p>
               <div className="bg-neutral-900 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600">
                     <TrendingUp size={20} />
                  </div>
                  <div>
                     <p className="text-xs font-black uppercase italic leading-none mb-1">Nível Elite</p>
                     <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Master 4 dias/freq</p>
                  </div>
               </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex justify-between items-center bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <button 
           onClick={() => setIsMenuOpen(true)}
           className="bg-neutral-900 border border-neutral-800 w-12 h-12 rounded-2xl flex items-center justify-center active:scale-95 transition-all text-white"
        >
          <Menu size={24} />
        </button>

        <div className="text-center">
          <h1 className="text-3xl font-black text-red-600 italic tracking-tighter leading-none">IRONFLOW</h1>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-600 text-center ml-1">STRENGTH FIRST</p>
        </div>
        
        <button 
          onClick={() => setActiveTab('profile')}
          className="bg-neutral-900 border border-neutral-800 w-12 h-12 rounded-2xl flex items-center justify-center active:scale-95 transition-transform overflow-hidden"
        >
          <User size={24} className="text-neutral-400" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 pb-40">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full pt-4"
          >
            {activeTab === 'home' && <Dashboard onStartWorkout={() => setActiveTab('workouts')} onStartHistory={() => setActiveTab('evolution')} />}
            {activeTab === 'workouts' && <WorkoutPlans onStartWorkout={(plan) => setIsTraining(plan)} />}
            {activeTab === 'exercises' && <ExerciseLibrary />}
            {activeTab === 'evolution' && <WorkoutHistory />}
            {activeTab === 'profile' && <ProfileSettings />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Central Floating Action Button */}
      <div className="fixed bottom-10 left-0 right-0 z-[50] flex justify-center pointer-events-none">
         <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveTab('workouts')}
            className="pointer-events-auto bg-red-600 text-white px-10 py-5 rounded-[32px] flex items-center gap-4 shadow-[0_20px_50px_rgba(220,38,38,0.4)] relative group overflow-hidden"
         >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            <Dumbbell size={24} className="group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-black uppercase italic tracking-widest">Iniciar Treino</span>
         </motion.button>
      </div>

      <div className="h-safe-bottom" />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
