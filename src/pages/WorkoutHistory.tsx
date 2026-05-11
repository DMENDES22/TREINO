import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { History, Calendar, Clock, TrendingUp, ChevronRight, Filter, Scale, Dumbbell } from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Session } from '../types';
import { AreaChart, Area, LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';

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

  const chartData = useMemo(() => {
    if (!profile?.measurementsHistory) return [];
    return profile.measurementsHistory.map(h => ({
      name: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      peso: h.weight,
      bf: h.fatPercentage || 0,
      cintura: h.waist || 0
    })).slice(-30);
  }, [profile?.measurementsHistory]);

  const stats = useMemo(() => {
    if (!sessions.length || !profile?.measurementsHistory?.length) return null;
    
    const lastWeight = profile.measurementsHistory[profile.measurementsHistory.length - 1]?.weight || 0;
    const prevWeight = profile.measurementsHistory[profile.measurementsHistory.length - 2]?.weight || lastWeight;
    const weightDiff = lastWeight - prevWeight;

    const totalVolume = sessions.reduce((acc, s) => acc + s.totalVolume, 0);
    const avgDuration = sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length;

    return { weightDiff, totalVolume, avgDuration };
  }, [sessions, profile]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pt-4 pb-20">
      {/* Evolution Summary */}
      <section className="grid grid-cols-2 gap-4">
         <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-2 block">Variação Peso</span>
            <div className="flex items-baseline gap-2">
               <h3 className={`text-4xl font-black italic tracking-tighter ${stats?.weightDiff && stats.weightDiff > 0 ? 'text-blue-500' : 'text-red-500'}`}>
                  {stats?.weightDiff && stats.weightDiff > 0 ? '+' : ''}{stats?.weightDiff?.toFixed(1) || '--'}
               </h3>
               <span className="text-xs font-black italic text-neutral-600">KG</span>
            </div>
            <p className="text-[9px] font-bold text-neutral-500 uppercase mt-2">Última Comparação</p>
         </div>
         <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-2 block">Volume Total</span>
            <div className="flex items-baseline gap-2">
               <h3 className="text-4xl font-black italic tracking-tighter text-white">
                  {stats?.totalVolume ? (stats.totalVolume / 1000).toFixed(0) : '--'}
               </h3>
               <span className="text-xs font-black italic text-neutral-600">TONS</span>
            </div>
            <p className="text-[9px] font-bold text-neutral-500 uppercase mt-2">Histórico Vitalício</p>
         </div>
      </section>

      {/* Charts Section */}
      <section className="space-y-6">
         <h3 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-600 px-2 underline decoration-red-600 underline-offset-8">Progresso Gráfico</h3>
         
         <div className="space-y-4">
            {/* Weight Chart */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-[40px] p-8">
               <div className="flex justify-between items-center mb-8">
                  <div>
                     <h4 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none mb-1">Peso Geral</h4>
                     <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">30 medições recentes</p>
                  </div>
                  <Scale size={24} className="text-red-600 opacity-20" />
               </div>
               <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                        <defs>
                           <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#000', border: '1px solid #171717', borderRadius: '16px', fontSize: '10px', padding: '12px' }}
                           itemStyle={{ color: '#fff', fontWeight: '900', textTransform: 'uppercase' }}
                        />
                        <Area type="monotone" dataKey="peso" stroke="#dc2626" fillOpacity={1} fill="url(#colorPeso)" strokeWidth={4} dot={{ r: 4, fill: '#dc2626', strokeWidth: 0 }} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* BF & Waist Chart */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-[40px] p-8">
               <div className="flex justify-between items-center mb-8">
                  <div>
                     <h4 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none mb-1">Shape & Fat</h4>
                     <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Cintura (cm) vs BF (%)</p>
                  </div>
                  <TrendingUp size={24} className="text-blue-600 opacity-20" />
               </div>
               <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={chartData}>
                        <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }} />
                        <Line type="stepAfter" dataKey="bf" stroke="#ef4444" strokeWidth={3} dot={false} />
                        <Line type="stepAfter" dataKey="cintura" stroke="#3b82f6" strokeWidth={3} dot={false} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
               <div className="flex gap-6 mt-6 justify-center">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/20" />
                     <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest italic">Percentual Gordura</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20" />
                     <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest italic">Medida Cintura</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* History List */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-600 underline decoration-white underline-offset-8">Logs de Batalha</h3>
        </div>

        <div className="space-y-4">
          {sessions.length > 0 ? (
            sessions.map((session, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                key={session.id}
                className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6 flex gap-5 active:scale-[0.98] transition-all"
              >
                <div className="w-16 h-16 bg-neutral-950 border border-red-600/30 rounded-[20px] flex flex-col items-center justify-center text-white relative overflow-hidden group">
                   <div className="absolute inset-0 bg-red-600/5 group-hover:bg-red-600/10 transition-colors" />
                   <span className="text-[10px] font-black uppercase leading-none opacity-50 z-10">{new Date(session.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                   <span className="text-2xl font-black italic tracking-tighter leading-none z-10">{new Date(session.date).getDate()}</span>
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-black text-white italic uppercase tracking-tighter truncate text-xl mb-1">{session.title}</h4>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-red-600" />
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{session.duration}m</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <Dumbbell size={14} className="text-red-500" />
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{(session.totalVolume / 1000).toFixed(1)}t</span>
                     </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                   <div className="w-10 h-10 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-600">
                      <ChevronRight size={20} />
                   </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-neutral-900/10 border-2 border-dashed border-neutral-900 rounded-[40px]">
               <h3 className="text-sm font-black uppercase text-neutral-700 tracking-widest mb-2 italic">Sem Histórico</h3>
               <p className="text-neutral-800 text-[10px] font-bold uppercase tracking-widest">O deserto aguarda seus primeiros passos.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
