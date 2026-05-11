import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Dumbbell, Clock, ChevronRight, Layers, X, Save, Trash2, Edit2, Type } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Workout } from '../types';
import WorkoutPlanEditor from '../components/WorkoutPlanEditor';

interface Props {
  onStartWorkout: (plan: Workout) => void;
}

export default function WorkoutPlans({ onStartWorkout }: Props) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Workout | null>(null);
  const [detailedEditingPlan, setDetailedEditingPlan] = useState<Workout | null>(null);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('Novo plano de treino');

  const fetchPlans = async () => {
    if (!user) return;
    setLoading(true);
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

  useEffect(() => {
    fetchPlans();
  }, [user]);

  const addPlan = async () => {
    if (!newPlanTitle.trim() || !user) return;
    
    if (editingPlan) {
      try {
        await updateDoc(doc(db, 'workouts', editingPlan.id), {
          title: newPlanTitle,
          description: newPlanDescription
        });
        setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, title: newPlanTitle, description: newPlanDescription } : p));
        setEditingPlan(null);
        setIsCreating(false);
        setNewPlanTitle('');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'workouts');
      }
      return;
    }

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

  const deletePlan = async (id: string, title: string) => {
    if (!window.confirm(`Deseja realmente excluir o treino "${title}"?`)) return;

    try {
      await deleteDoc(doc(db, 'workouts', id));
      setPlans(prev => prev.filter(p => p.id !== id));
      alert('Treino removido com sucesso.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'workouts');
    }
  };

  const handleEdit = (plan: Workout) => {
    setEditingPlan(plan);
    setNewPlanTitle(plan.title);
    setNewPlanDescription(plan.description || '');
    setIsCreating(true);
  };

  return (
    <div className="space-y-6 pt-2 pb-10">
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
                onClick={() => onStartWorkout(plan)}
                className="group bg-neutral-900 border border-neutral-800 rounded-3xl p-5 hover:border-red-600/40 transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
              >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-600/5 blur-3xl group-hover:bg-red-600/10 transition-colors" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-red-600/20 text-red-500 text-[10px] font-black px-2 py-1 rounded-md tracking-widest uppercase">Personalizado</span>
                    <div className="flex gap-2 relative z-10">
                      <button 
                         onClick={(e) => { e.stopPropagation(); setDetailedEditingPlan(plan); }}
                         className="p-1.5 bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
                         title="Editar Exercícios"
                      >
                         <Edit2 size={14} />
                      </button>
                      <button 
                         onClick={(e) => { e.stopPropagation(); handleEdit(plan); }}
                         className="p-1.5 bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
                         title="Editar Título"
                      >
                         <Type size={14} />
                      </button>
                      <button 
                         onClick={(e) => { e.stopPropagation(); deletePlan(plan.id, plan.title); }}
                         className="p-1.5 bg-neutral-800 rounded-lg text-neutral-400 hover:text-red-500 transition-colors"
                         title="Excluir"
                      >
                         <Trash2 size={14} />
                      </button>
                    </div>
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
                          <span className="text-xs font-black text-neutral-400">{plan.exercises.reduce((acc, ex) => acc + (ex.restTime * ex.sets.length / 60), 0) > 0 ? plan.exercises.reduce((acc, ex) => acc + (ex.restTime * ex.sets.length / 60), 0).toFixed(0) : 45}m</span>
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
        {detailedEditingPlan && (
          <WorkoutPlanEditor 
             plan={detailedEditingPlan}
             onClose={() => setDetailedEditingPlan(null)}
             onSave={(updated) => {
                setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
                setDetailedEditingPlan(updated);
             }}
          />
        )}
      </AnimatePresence>

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
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{editingPlan ? 'Editar Plano' : 'Novo Plano'}</h3>
                <button onClick={() => { setIsCreating(false); setEditingPlan(null); setNewPlanTitle(''); }} className="p-2 hover:bg-neutral-800 rounded-lg text-white"><X size={24} /></button>
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

                <div className="grid grid-cols-1 gap-4">
                   <button 
                     onClick={addPlan}
                     className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 text-white shadow-lg shadow-red-600/20 transition-all active:scale-95"
                   >
                     <Save size={20} /> {editingPlan ? 'Atualizar Plano' : 'Salvar Plano'}
                   </button>
                </div>
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
