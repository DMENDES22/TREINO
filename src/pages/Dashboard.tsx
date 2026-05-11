import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { TrendingUp, Clock, Calendar, ChevronRight, Play, Dumbbell } from 'lucide-react';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Session } from '../types';

export default function Dashboard({ onStartWorkout, onStartHistory }: { onStartWorkout: () => void, onStartHistory: () => void }) {
  const { profile } = useAuth();
  const [lastSession, setLastSession] = useState<Session | null>(null);
  const [weeklyVolume, setWeeklyVolume] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      try {
        // Last Session
        const qLast = query(
          collection(db, `users/${profile.uid}/sessions`),
          orderBy('date', 'desc'),
          limit(1)
        );
        const querySnapshot = await getDocs(qLast);
        if (!querySnapshot.empty) {
          setLastSession({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Session);
        }

        // Weekly Volume
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const qWeek = query(
          collection(db, `users/${profile.uid}/sessions`),
          where('date', '>=', oneWeekAgo)
        );
        const weekSnapshot = await getDocs(qWeek);
        let total = 0;
        weekSnapshot.forEach(doc => {
          total += (doc.data() as Session).totalVolume || 0;
        });
        setWeeklyVolume(total);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, [profile]);

  return (
    <div className="space-y-8 pt-4 pb-12">
      {/* Header Metric */}
      <section className="relative overflow-hidden bg-red-600 rounded-[40px] p-8 shadow-2xl shadow-red-600/20 group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-100/60 mb-2 block">Volume Semanal</span>
         <div className="flex items-baseline gap-2">
            <h2 className="text-6xl font-black italic tracking-tighter text-white">{(weeklyVolume / 1000).toFixed(1)}</h2>
            <span className="text-xl font-black italic text-red-200">TONS</span>
         </div>
         <p className="text-red-100/80 text-xs font-bold mt-4 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={14} /> +12% vs semana passada
         </p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
         <MetricCard 
            label="Peso Atual" 
            value={profile?.weight ? `${profile.weight}` : '--'} 
            unit="KG" 
            color="text-white"
         />
         <MetricCard 
            label="BF Estimado" 
            value={profile?.fatPercentage ? `${profile.fatPercentage}` : '--'} 
            unit="%" 
            color="text-red-500"
         />
      </div>

      {/* Next/Last Split */}
      <div className="grid grid-cols-1 gap-4">
         <section className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6 flex flex-col justify-between min-h-[160px] group active:scale-[0.98] transition-all cursor-pointer" onClick={onStartWorkout}>
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Próximo Treino</span>
               <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/20 group-hover:rotate-12 transition-transform">
                  <Play size={20} fill="currentColor" />
               </div>
            </div>
            <div>
               <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-1">Peito & Tríceps</h3>
               <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Baseado no seu histórico de 4 dias</p>
            </div>
         </section>

         <section className="bg-neutral-950 border border-neutral-800 rounded-[32px] p-6 flex flex-col justify-between min-h-[160px]" onClick={onStartHistory}>
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Última Sessão</span>
               <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-400">
                  <Clock size={20} />
               </div>
            </div>
            <div>
               <h3 className="text-xl font-black italic tracking-tighter uppercase mb-1">
                  {lastSession ? lastSession.title : 'Nenhum treino'}
               </h3>
               <div className="flex items-center gap-3">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                     {lastSession ? `${new Date(lastSession.date).toLocaleDateString('pt-BR')}` : 'Comece hoje'}
                  </p>
                  {lastSession && (
                     <span className="w-1 h-1 bg-neutral-800 rounded-full" />
                  )}
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                     {lastSession ? `${lastSession.totalVolume}kg total` : ''}
                  </p>
               </div>
            </div>
         </section>
      </div>
    </div>
  );
}

const MetricCard = ({ label, value, unit, color }: { label: string, value: string, unit: string, color: string }) => (
  <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6">
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-4 block whitespace-nowrap">{label}</span>
    <div className="flex items-baseline gap-1">
       <span className={`text-4xl font-black italic tracking-tighter ${color}`}>{value}</span>
       <span className="text-xs font-black italic text-neutral-600">{unit}</span>
    </div>
  </div>
);
