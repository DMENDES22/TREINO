import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Home, Dumbbell, History, User, PlusCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import Dashboard from './pages/Dashboard';
import ExerciseLibrary from './pages/ExerciseLibrary';
import WorkoutPlans from './pages/WorkoutPlans';
import WorkoutHistory from './pages/WorkoutHistory';
import ProfileSettings from './pages/ProfileSettings';
import AuthPage from './pages/AuthPage';
import ActiveWorkout from './pages/ActiveWorkout';
import Nutrition from './pages/Nutrition';

type Tab = 'home' | 'exercises' | 'workouts' | 'history' | 'profile' | 'nutrition';

const MainApp = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isTraining, setIsTraining] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (user && !profile) {
    return <ProfileSettings isInitialSetup={true} />;
  }

  if (isTraining) {
    return <ActiveWorkout onFinish={() => setIsTraining(false)} />;
  }

  const menuItems = [
    { id: 'home', icon: <Home size={20} />, label: 'Início' },
    { id: 'nutrition', icon: <Search size={20} />, label: 'Nutrição' },
    { id: 'exercises', icon: <PlusCircle size={20} />, label: 'Biblioteca' },
    { id: 'workouts', icon: <Dumbbell size={20} />, label: 'Meus Treinos' },
    { id: 'history', icon: <History size={20} />, label: 'Histórico' },
    { id: 'profile', icon: <User size={20} />, label: 'Perfil' },
  ];

  return (
    <div className="flex flex-col h-screen bg-black text-white max-w-md mx-auto relative overflow-hidden">
      {/* Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-neutral-950 border-r border-neutral-800 z-50 p-6 flex flex-col"
            >
              <div className="mb-12">
                <h1 className="text-2xl font-black text-red-600 italic tracking-tighter">IRONFLOW</h1>
              </div>

              <div className="space-y-2 flex-1">
                {menuItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as Tab);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl font-bold transition-all ${activeTab === item.id ? 'bg-red-600 text-white' : 'text-neutral-500 hover:bg-neutral-900'}`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-neutral-800">
                 <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest text-center">v1.0.0 Beta</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-black/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-neutral-900 rounded-lg transition-colors"
          >
            <div className="w-6 h-0.5 bg-white mb-1.5 rounded-full" />
            <div className="w-4 h-0.5 bg-white mb-1.5 rounded-full" />
            <div className="w-6 h-0.5 bg-white rounded-full" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white italic tracking-tighter">
              {activeTab === 'home' && 'DASHBOARD'}
              {activeTab === 'nutrition' && 'NUTRIÇÃO'}
              {activeTab === 'exercises' && 'BIBLIOTECA'}
              {activeTab === 'workouts' && 'MEUS TREINOS'}
              {activeTab === 'history' && 'HISTÓRICO'}
              {activeTab === 'profile' && 'PERFIL'}
            </h1>
          </div>
        </div>
        
        <button 
          onClick={() => setIsTraining(true)}
          className="bg-red-600 p-2 rounded-full shadow-lg shadow-red-600/20 active:scale-95 transition-transform"
        >
          <PlusCircle size={24} />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
            className="h-full"
          >
            {activeTab === 'home' && <Dashboard onStartWorkout={() => setIsTraining(true)} />}
            {activeTab === 'nutrition' && <Nutrition />}
            {activeTab === 'exercises' && <ExerciseLibrary />}
            {activeTab === 'workouts' && <WorkoutPlans />}
            {activeTab === 'history' && <WorkoutHistory />}
            {activeTab === 'profile' && <ProfileSettings />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center transition-all duration-300 ${active ? 'text-red-500 scale-110' : 'text-neutral-500'}`}
  >
    <div className={`p-1 rounded-lg ${active ? 'bg-red-500/10' : ''}`}>
      {icon}
    </div>
    <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{label}</span>
  </button>
);

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
