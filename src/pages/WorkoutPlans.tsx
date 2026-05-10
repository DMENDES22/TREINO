import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Dumbbell, Clock, ChevronRight, Layers, X, Save } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Workout } from '../types';

export default function WorkoutPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('Novo plano de treino');

  useEffect(() => {
    const fetchPlans = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'workouts'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedPlans: Workout[] = [];
        querySnapshot.forEach((doc) => {
          fetchedPlans.push({ id: doc.id, ...doc.data() } as Workout);
        });
        setPlans(fetchedPlans);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'workouts');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [user]);

  const addPlan = async () => {
    if (!newPlanTitle.trim() || !user) return;
    
    const newPlanData = {
      userId: user.uid,
      title: newPlanTitle,
      description: newPlanDescription,
      exercises: [],
      createdAt: Date.now()
    };

    try {
      const docRef = await addDoc(collection(db, 'workouts'), newPlanData);
      setPlans([...plans, { id: docRef.id, ...newPlanData } as Workout]);
      setIsCreating(false);
      setNewPlanTitle('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'workouts');
    }
  };

  return (
    <div className="space-y-6 pt-2 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
           <Layers className="text-red-500" size={20} />
           <h2 className="text-xl font-black uppercase tracking-tight">Meus Planos</h2>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-transform"
        >
           <Plus size={20} className="text-white" />
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Carregando Planos...</p>
          </div>
        ) : (
          <>
            {plans.map((plan, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={plan.id}
                className="group bg-neutral-900 border border-neutral-800 rounded-3xl p-5 hover:border-red-600/40 transition-all cursor-pointer relative overflow-hidden"
              >
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-600/5 blur-3xl group-hover:bg-red-600/10 transition-colors" />
                 
                 <div className="flex items-center gap-2 mb-4">
                    <span className="bg-red-600/20 text-red-500 text-[10px] font-black px-2 py-1 rounded-md tracking-widest uppercase">Personalizado</span>
                 </div>

                 <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4 text-white group-hover:text-red-500 transition-colors">{plan.title}</h3>
                 
                 <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                       <div className="flex items-center gap-1.5">
                          <Dumbbell size={14} className="text-neutral-500" />
                          <span className="text-xs font-black text-neutral-400">{plan.exercises.length} EXS</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-neutral-500" />
                          <span className="text-xs font-black text-neutral-400">{plan.exercises.reduce((acc, ex) => acc + (ex.restTime * ex.sets.length / 60), 45).toFixed(0)}m</span>
                       </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                       <ChevronRight size={16} className="text-neutral-500 group-hover:text-white" />
                    </div>
                 </div>
              </motion.div>
            ))}

            <button 
              onClick={() => setIsCreating(true)}
              className="w-full py-8 border-2 border-dashed border-neutral-800 rounded-3xl flex flex-col items-center justify-center gap-2 text-neutral-600 hover:text-red-500 hover:border-red-600/30 transition-all group"
            >
               <div className="p-3 bg-neutral-900 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all">
                  <Plus size={24} />
               </div>
               <span className="font-black uppercase tracking-widest text-xs">Criar Novo Plano</span>
            </button>
          </>
        )}
      </div>

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 500 }}
              animate={{ y: 0 }}
              exit={{ y: 500 }}
              className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Novo Plano</h3>
                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-neutral-800 rounded-lg text-white"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-2 block">Título do Plano</label>
                  <input 
                    autoFocus
                    value={newPlanTitle}
                    onChange={e => setNewPlanTitle(e.target.value)}
                    placeholder="Ex: Treino A - Superior"
                    className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 font-bold text-white focus:border-red-600 outline-none"
                  />
                </div>

                <button 
                  onClick={addPlan}
                  className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 text-white"
                >
                  <Save size={20} /> Salvar Plano
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="bg-neutral-900/40 rounded-3xl p-6 mt-8">
         <h4 className="text-xs font-black uppercase text-neutral-600 mb-4 tracking-widest">Dicas Rápidas</h4>
         <div className="space-y-3">
            <p className="text-[11px] text-neutral-500 font-medium leading-relaxed italic">
               Dica: Foque na progressão de carga e técnica antes de aumentar o volume do treino.
            </p>
         </div>
      </section>
    </div>
  );
}
