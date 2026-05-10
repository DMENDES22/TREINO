import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Calendar, ChevronRight, Play, Dumbbell } from 'lucide-react';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Session } from '../types';

export default function Dashboard({ onStartWorkout }: { onStartWorkout: () => void }) {
  const { profile } = useAuth();
  const [lastSession, setLastSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchLastSession = async () => {
      if (!profile) return;
      try {
        const q = query(
          collection(db, `users/${profile.uid}/sessions`),
          orderBy('date', 'desc'),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setLastSession({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Session);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${profile.uid}/sessions`);
      }
    };
    fetchLastSession();
  }, [profile]);

  const [weeklyProgress, setWeeklyProgress] = useState<number[]>(new Array(7).fill(0));

  useEffect(() => {
    const fetchWeeklyData = async () => {
      if (!profile) return;
      try {
        const lastWeek = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const q = query(
          collection(db, `users/${profile.uid}/sessions`),
          where('date', '>=', lastWeek),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const days = new Array(7).fill(0);
        
        querySnapshot.forEach(doc => {
          const session = doc.data() as Session;
          const dayIndex = 6 - Math.floor((Date.now() - session.date) / (24 * 60 * 60 * 1000));
          if (dayIndex >= 0 && dayIndex < 7) {
            days[dayIndex] += session.totalVolume;
          }
        });
        
        const maxVolume = Math.max(...days, 1);
        setWeeklyProgress(days.map(v => (v / maxVolume) * 100));
      } catch (error) {
        console.error('Error fetching weekly data:', error);
      }
    };
    fetchWeeklyData();
  }, [profile]);

  return (
    <div className="space-y-6 pt-2 pb-8">
      {/* Welcome Card */}
      <section>
        <h2 className="text-3xl font-black tracking-tight">Olá, <span className="text-red-500">{profile?.displayName?.split(' ')[0]}</span>! 👋</h2>
        <p className="text-neutral-500 font-medium tracking-tight">Pronto para bater seus recordes hoje?</p>
      </section>

      {/* Quick Start Card */}
      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={onStartWorkout}
        className="relative overflow-hidden bg-red-600 rounded-3xl p-6 shadow-2xl shadow-red-600/30 group cursor-pointer"
      >
        <div className="absolute -right-8 -bottom-8 opacity-20 group-hover:scale-110 transition-transform duration-500">
           <Play size={160} className="fill-white" />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-black italic">TREINO DO DIA</h3>
          <p className="text-red-100 text-sm font-bold opacity-80 mb-6">Peito & Tríceps (Recomendado)</p>
          <div className="bg-white text-red-600 inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm uppercase">
            Iniciar Agora <Play size={14} className="fill-red-600" />
          </div>
        </div>
      </motion.div>

       {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard 
          icon={<Clock className="text-orange-500" size={18} />} 
          label="Tempo" 
          value={lastSession ? `${lastSession.duration}m` : '--'} 
          subValue="Duração" 
        />
        <StatCard 
          icon={<TrendingUp className="text-green-500" size={18} />} 
          label="Volume" 
          value={lastSession ? `${(lastSession.totalVolume / 1000).toFixed(1)}t` : '--'} 
          subValue="Toneladas" 
        />
        <StatCard 
          icon={<Dumbbell className="text-red-500" size={18} />} 
          label="Séries" 
          value={lastSession ? `${lastSession.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)}` : '--'} 
          subValue="Concluídas" 
        />
      </div>

      {/* Last Session */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black uppercase tracking-tight text-neutral-300">Última Atividade</h3>
          <button className="text-red-500 text-xs font-bold uppercase tracking-widest flex items-center">
            Ver tudo <ChevronRight size={14} />
          </button>
        </div>
        
        {lastSession ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center">
              <Calendar size={24} className="text-neutral-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white">{lastSession.title}</h4>
              <p className="text-neutral-500 text-xs font-medium">
                {new Date(lastSession.date).toLocaleDateString('pt-BR')} • {lastSession.duration} min
              </p>
            </div>
            <div className="text-right">
               <p className="text-sm font-black text-white">{lastSession.totalVolume}kg</p>
               <p className="text-[10px] text-neutral-500 font-bold uppercase">Volume</p>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-900/50 border border-neutral-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
             <p className="text-neutral-500 font-bold text-sm mb-2">Nenhum treino registrado ainda.</p>
             <p className="text-neutral-600 text-xs">Suas conquistas aparecerão aqui.</p>
          </div>
        )}
      </section>

      {/* Progress Chart Placeholder */}
      <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
        <h3 className="text-lg font-black uppercase tracking-tight text-neutral-300 mb-4">Evolução Semanal</h3>
        <div className="h-40 w-full flex items-end justify-between gap-2 px-2">
           {weeklyProgress.map((val, i) => {
             const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
             const today = new Date().getDay();
             const dayLabel = days[(today - (6 - i) + 7) % 7];
             
             return (
               <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${Math.max(val, 5)}%` }}
                     className={`w-full rounded-t-lg shadow-lg ${i === 6 ? 'bg-red-500 shadow-red-500/20' : 'bg-neutral-800'}`} 
                  />
                  <span className="text-[10px] font-bold text-neutral-600">
                    {dayLabel}
                  </span>
               </div>
             );
           })}
        </div>
      </section>
    </div>
  );
}

const StatCard = ({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue: string }) => (
  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">{label}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-black tabular-nums">{value}</span>
      <span className="text-[10px] font-bold text-neutral-600 uppercase mt-0.5">{subValue}</span>
    </div>
  </div>
);
