import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { History, Calendar, Clock, TrendingUp, ChevronRight, Filter } from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Session } from '../types';

export default function WorkoutHistory() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!profile) return;
      try {
        const q = query(
          collection(db, `users/${profile.uid}/sessions`),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
        setSessions(data);
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, `users/${profile.uid}/sessions`);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [profile]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
           <History className="text-red-500" size={20} />
           <h2 className="text-xl font-black uppercase tracking-tight">Atividade Recente</h2>
        </div>
        <button className="bg-neutral-900 p-2 rounded-xl border border-neutral-800">
           <Filter size={18} className="text-neutral-500" />
        </button>
      </div>

      <div className="space-y-4">
        {sessions.length > 0 ? (
          sessions.map((session, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={session.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex gap-4 hover:border-red-600/30 transition-colors"
            >
              <div className="w-14 h-14 bg-red-600/10 rounded-2xl flex flex-col items-center justify-center text-red-500">
                 <span className="text-[10px] font-black uppercase leading-none">{new Date(session.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                 <span className="text-xl font-black leading-none">{new Date(session.date).getDate()}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-white uppercase tracking-tight truncate">{session.title}</h4>
                <div className="flex gap-4 mt-1">
                   <div className="flex items-center gap-1">
                      <Clock size={12} className="text-neutral-600" />
                      <span className="text-[10px] font-bold text-neutral-550 uppercase tracking-tighter">{session.duration}m</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <TrendingUp size={12} className="text-neutral-600" />
                      <span className="text-[10px] font-bold text-neutral-550 uppercase tracking-tighter">{session.totalVolume}kg</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                 <ChevronRight className="text-neutral-700" size={20} />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
             <div className="w-20 h-20 bg-neutral-900/50 rounded-full flex items-center justify-center mb-6">
                <History className="text-neutral-800" size={40} />
             </div>
             <h3 className="text-lg font-black uppercase text-neutral-400">Nenhum registro</h3>
             <p className="text-neutral-600 text-sm max-w-[200px]">Inicie seu primeiro treino para ver seu histórico aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
}
