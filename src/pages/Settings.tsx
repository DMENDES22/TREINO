import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Cloud, 
  RefreshCw, 
  Trash2, 
  ChevronRight, 
  X, 
  Shield, 
  Info, 
  LogIn, 
  LogOut, 
  Key, 
  Clock, 
  Volume2, 
  Zap, 
  Activity, 
  Palette, 
  Type, 
  Wind, 
  Target, 
  Download, 
  Database, 
  Battery, 
  FastForward, 
  Lock, 
  EyeOff,
  User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, doc, writeBatch } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function Settings() {
  const { user, profile, login } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [resetConfirm, setResetConfirm] = useState('');

  // Setting States (Visual only for now, logic can be added later)
  const [activeTheme, setActiveTheme] = useState('Dark Brutalista');
  const [restTime, setRestTime] = useState('60s');
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const handleResetData = async () => {
    if (resetConfirm !== 'APAGAR' || !user) return;

    try {
      const batch = writeBatch(db);
      const collections = ['sessions', 'workouts', 'measurements'];
      
      for (const coll of collections) {
        const q = query(collection(db, `users/${user.uid}/${coll}`));
        const snapshot = await getDocs(q);
        snapshot.forEach(d => batch.delete(d.ref));
      }
      
      await batch.commit();
      alert('Dados resetados com sucesso!');
      setIsResetting(false);
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-12 pt-2 pb-40">
      <header className="px-2">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">MENU CONFIG</h2>
        <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">Ambiente de Controle</p>
      </header>

      {/* LOGIN / ACCOUNT */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2 mb-4">
          <User size={14} className="text-red-600" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Conta & Acesso</h3>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] overflow-hidden">
          {!user ? (
            <button 
               onClick={login}
               className="w-full flex items-center justify-between p-8 bg-white text-black active:scale-[0.98] transition-all"
            >
               <div className="flex items-center gap-4">
                  <LogIn size={24} />
                  <span className="font-black uppercase italic tracking-tighter text-lg">Entrar com Google</span>
               </div>
               <ChevronRight size={20} />
            </button>
          ) : (
            <>
              <SettingItem icon={<LogOut size={20} className="text-red-500" />} label="Sair da Conta" onClick={handleLogout} />
              <SettingItem icon={<Key size={20} />} label="Recuperar Conta" showChevron />
            </>
          )}
        </div>
      </section>

      {/* TREINO */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2 mb-4">
          <Clock size={14} className="text-red-600" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Execução & Performance</h3>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] overflow-hidden">
          <SettingItem 
            icon={<Clock size={20} />} 
            label="Tempo Descanso" 
            value={restTime} 
            onClick={() => {
              const times = ['30s', '45s', '60s', '90s', 'Personalizado'];
              const next = times[(times.indexOf(restTime) + 1) % times.length];
              setRestTime(next);
            }} 
          />
          <SettingToggle icon={<Volume2 size={20} />} label="Sons do Treino" active={soundsEnabled} onToggle={() => setSoundsEnabled(!soundsEnabled)} />
          <SettingToggle icon={<Zap size={20} />} label="Vibração do Timer" active={vibrationEnabled} onToggle={() => setVibrationEnabled(!vibrationEnabled)} />
          <SettingItem icon={<Activity size={20} />} label="Modo Treino Auto" showChevron />
        </div>
      </section>

      {/* INTERFACE */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2 mb-4">
          <Palette size={14} className="text-red-600" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Visual & Experiência</h3>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] overflow-hidden">
          <SettingItem 
            icon={<Palette size={20} />} 
            label="Tema do App" 
            value={activeTheme} 
            onClick={() => {
              const themes = ['Dark Brutalista', 'Dark Vermelho', 'Dark Cinza'];
              const next = themes[(themes.indexOf(activeTheme) + 1) % themes.length];
              setActiveTheme(next);
            }}
          />
          <SettingItem icon={<Type size={20} />} label="Tamanho da Fonte" value="Média" />
          <SettingToggle icon={<Wind size={20} />} label="Animações Fluidas" active={true} />
          <SettingToggle icon={<Target size={20} />} label="Modo Foco Extremo" active={false} />
        </div>
      </section>

      {/* RESET */}
      <section className="pt-8">
        <button 
          onClick={() => setIsResetting(true)}
          className="w-full flex items-center justify-between p-8 bg-red-600/5 border border-red-600/20 rounded-[40px] text-red-500 active:scale-95 transition-all group"
        >
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center">
              <Trash2 size={24} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div className="text-left">
              <span className="block font-black uppercase italic tracking-tighter text-lg leading-none mb-1">Resetar Total</span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Cuidado: Ação Irreversível</span>
            </div>
          </div>
          <ChevronRight size={20} />
        </button>
      </section>

      <AnimatePresence>
        {isResetting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-950 border border-neutral-800 rounded-[48px] p-10 max-w-sm w-full shadow-[0_0_100px_rgba(220,38,38,0.2)]"
            >
               <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-red-600/20 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                     <Trash2 className="text-red-500" size={40} />
                  </div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none mb-4">TEM CERTEZA?</h3>
               </div>

               <div className="space-y-6">
                  <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800">
                     <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-4 text-center">Digite "APAGAR" para confirmar</label>
                     <input 
                       value={resetConfirm}
                       onChange={e => setResetConfirm(e.target.value.toUpperCase())}
                       className="w-full bg-black border-2 border-neutral-800 rounded-2xl px-4 py-5 font-black text-white italic uppercase focus:border-red-600 outline-none text-center text-xl tracking-tighter transition-all"
                       placeholder="..."
                     />
                  </div>
                  <div className="flex flex-col gap-3">
                     <button 
                        disabled={resetConfirm !== 'APAGAR'}
                        onClick={handleResetData}
                        className={`w-full py-5 rounded-3xl font-black uppercase text-xs tracking-widest transition-all ${resetConfirm === 'APAGAR' ? 'bg-red-600 text-white shadow-2xl shadow-red-600/40' : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'}`}
                     >
                        Confirmar Exclusão
                     </button>
                     <button onClick={() => { setIsResetting(false); setResetConfirm(''); }} className="w-full py-4 text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Voltar</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingItem({ icon, label, value, showChevron, onClick }: { icon: React.ReactNode, label: string, value?: string, showChevron?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-6 hover:bg-neutral-800/50 transition-all border-b border-neutral-800 last:border-0 text-left group ${onClick ? 'active:scale-98' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 group-hover:text-red-500 transition-colors">
          {icon}
        </div>
        <span className="font-black uppercase italic tracking-tighter text-sm text-neutral-200">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {value && <span className="text-[10px] font-black text-red-600 bg-red-600/5 border border-red-600/10 px-3 py-1 rounded-full italic">{value}</span>}
        {showChevron && <ChevronRight size={16} className="text-neutral-700" />}
      </div>
    </button>
  );
}

function SettingToggle({ icon, label, active, onToggle }: { icon: React.ReactNode, label: string, active: boolean, onToggle?: () => void }) {
  return (
    <div className="w-full flex items-center justify-between p-6 border-b border-neutral-800 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-red-600 text-white' : 'bg-neutral-950 border border-neutral-800 text-neutral-600'}`}>
          {icon}
        </div>
        <span className="font-black uppercase italic tracking-tighter text-sm text-neutral-200">{label}</span>
      </div>
      <button 
        onClick={onToggle}
        className={`w-14 h-8 rounded-full relative transition-all ${active ? 'bg-red-600 shadow-md shadow-red-600/20' : 'bg-neutral-800'}`}
      >
        <motion.div 
          animate={{ x: active ? 28 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm" 
        />
      </button>
    </div>
  );
}
