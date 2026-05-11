import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { X, Save, Plus, Trash2, Dumbbell, Clock, Type, ChevronRight, GripVertical, Edit3 } from 'lucide-react';
import { Workout, WorkoutExercise, Exercise, Set, MuscleGroup } from '../types';
import { EXERCISES } from '../data/exercises';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface Props {
  plan: Workout;
  onClose: () => void;
  onSave: (updatedPlan: Workout) => void;
}

export default function WorkoutPlanEditor({ plan, onClose, onSave }: Props) {
  const [editedPlan, setEditedPlan] = useState<Workout>({ ...plan });
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [selectedExForEdit, setSelectedExForEdit] = useState<number | null>(null);

  const handleSave = async (dataToSave = editedPlan) => {
    try {
      await updateDoc(doc(db, 'workouts', plan.id), {
        exercises: dataToSave.exercises,
        title: dataToSave.title,
        description: dataToSave.description
      });
      onSave(dataToSave);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'workouts');
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(editedPlan) !== JSON.stringify(plan)) {
        handleSave(editedPlan);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [editedPlan]);

  const addExercise = (exercise: Exercise) => {
    const newEx: WorkoutExercise = {
      ...exercise,
      sets: [{ reps: 12, weight: 0, completed: false, type: 'V' }],
      restTime: 60,
      notes: ''
    };
    setEditedPlan({
      ...editedPlan,
      exercises: [...editedPlan.exercises, newEx]
    });
    setShowExercisePicker(false);
  };

  const removeExercise = (index: number) => {
    const news = [...editedPlan.exercises];
    news.splice(index, 1);
    setEditedPlan({ ...editedPlan, exercises: news });
  };

  const updateExercise = (index: number, updates: Partial<WorkoutExercise>) => {
    const news = [...editedPlan.exercises];
    news[index] = { ...news[index], ...updates };
    setEditedPlan({ ...editedPlan, exercises: news });
  };

  const handleReorder = (newExercises: WorkoutExercise[]) => {
    setEditedPlan({ ...editedPlan, exercises: newExercises });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col max-w-md mx-auto">
      <header className="p-6 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-neutral-900 rounded-lg text-neutral-400">
            <X size={24} />
          </button>
          <div className="flex flex-col">
             <input 
               value={editedPlan.title}
               onChange={e => setEditedPlan({ ...editedPlan, title: e.target.value })}
               className="bg-transparent border-none text-xl font-black italic uppercase tracking-tighter text-white focus:outline-none"
             />
             <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Editando Plano</span>
          </div>
        </div>
        <button 
           onClick={() => handleSave()}
           className="bg-red-600 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/30"
        >
           Salvar
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        <Reorder.Group axis="y" values={editedPlan.exercises} onReorder={handleReorder} className="space-y-4">
          {editedPlan.exercises.map((ex, index) => (
            <Reorder.Item 
              key={`${ex.id}-${index}`} 
              value={ex}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 hover:border-neutral-700 transition-all select-none"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className="cursor-grab active:cursor-grabbing text-neutral-600 hover:text-white transition-colors p-1 touch-none">
                      <GripVertical size={20} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-white text-sm uppercase tracking-tight truncate">{ex.name}</h4>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{ex.category}</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setSelectedExForEdit(index)}
                     className="p-2 bg-neutral-800 rounded-xl text-neutral-400 hover:text-white"
                   >
                     <Edit3 size={16} />
                   </button>
                   <button 
                     onClick={() => removeExercise(index)}
                     className="p-2 bg-neutral-800 rounded-xl text-neutral-400 hover:text-red-500"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                 <div className="bg-black/40 rounded-xl p-2 border border-neutral-800/50 flex flex-col items-center">
                    <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-1">Séries</span>
                    <span className="text-xs font-black text-white">{ex.sets.length}</span>
                 </div>
                 <div className="bg-black/40 rounded-xl p-2 border border-neutral-800/50 flex flex-col items-center">
                    <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-1">Carga Méd.</span>
                    <span className="text-xs font-black text-white">{ex.sets[0]?.weight || 0}kg</span>
                 </div>
                 <div className="bg-black/40 rounded-xl p-2 border border-neutral-800/50 flex flex-col items-center">
                    <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-1">Descanso</span>
                    <span className="text-xs font-black text-white">{ex.restTime}s</span>
                 </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        <button 
          onClick={() => setShowExercisePicker(true)}
          className="w-full py-12 border-2 border-dashed border-neutral-800 rounded-[40px] text-neutral-600 flex flex-col items-center justify-center gap-2 hover:text-red-500 hover:border-red-600/30 transition-all bg-neutral-900/10 group"
        >
           <div className="p-3 bg-neutral-900 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all">
              <Plus size={24} />
           </div>
           <span className="font-black uppercase tracking-widest text-[9px]">Adicionar Exercício</span>
        </button>
      </main>

      {/* Exercise Edit Details Overlay */}
      <AnimatePresence>
        {selectedExForEdit !== null && (
          <ExerciseDetailsEditor 
             exercise={editedPlan.exercises[selectedExForEdit]} 
             onClose={() => setSelectedExForEdit(null)}
             onSave={(updates) => {
                updateExercise(selectedExForEdit, updates);
                setSelectedExForEdit(null);
             }}
          />
        )}
      </AnimatePresence>

      {/* Exercise Picker Overlay */}
      <AnimatePresence>
        {showExercisePicker && (
          <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md p-4">
             <motion.div 
               initial={{ y: 100, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 100, opacity: 0 }}
               className="bg-neutral-950 border border-neutral-800 h-full rounded-[40px] flex flex-col overflow-hidden shadow-2xl"
             >
                <div className="p-6 border-b border-neutral-900 flex justify-between items-center bg-neutral-950">
                   <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Escolher Exercício</h3>
                   <button onClick={() => setShowExercisePicker(false)} className="p-2 hover:bg-neutral-900 rounded-full text-white"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                   {EXERCISES.map(ex => (
                      <button 
                        key={ex.id}
                        onClick={() => addExercise(ex)}
                        className="w-full text-left bg-neutral-900 p-4 rounded-3xl flex items-center justify-between group active:scale-95 transition-all border border-transparent hover:border-red-600/30"
                      >
                         <div>
                            <h4 className="font-extrabold text-white uppercase tracking-tight text-sm">{ex.name}</h4>
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{ex.category}</span>
                         </div>
                         <Plus size={16} className="text-red-600" />
                      </button>
                   ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExerciseDetailsEditor({ exercise, onClose, onSave }: { exercise: WorkoutExercise, onClose: () => void, onSave: (updates: Partial<WorkoutExercise>) => void }) {
  const [data, setData] = useState<Partial<WorkoutExercise>>({ ...exercise });

  const addSet = () => {
    const news = [...(data.sets || [])];
    const last = news[news.length - 1];
    news.push({ reps: last?.reps || 12, weight: last?.weight || 0, completed: false, type: 'V' });
    setData({ ...data, sets: news });
  };

  const removeSet = (idx: number) => {
    const news = [...(data.sets || [])];
    news.splice(idx, 1);
    setData({ ...data, sets: news });
  };

  const updateSet = (idx: number, field: keyof Set, val: any) => {
    const news = [...(data.sets || [])];
    news[idx] = { ...news[idx], [field]: val };
    setData({ ...data, sets: news });
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-neutral-950 border border-neutral-800 w-full max-w-sm rounded-[40px] flex flex-col overflow-hidden shadow-2xl"
      >
        <header className="p-6 border-b border-neutral-900 flex justify-between items-center">
           <div className="flex flex-col">
              <h3 className="text-lg font-black italic uppercase text-white tracking-tighter">{exercise.name}</h3>
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Configuração</span>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-neutral-900 rounded-full text-white"><X size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest px-1">Nome do Exercício</label>
              <input 
                 value={data.name}
                 onChange={e => setData({ ...data, name: e.target.value })}
                 className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 font-bold text-white outline-none focus:border-red-600"
              />
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                 <h4 className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Séries & Reps</h4>
                 <button onClick={addSet} className="text-red-500 font-black text-[10px] uppercase tracking-widest border border-red-600/30 px-3 py-1 rounded-full">+ Add Série</button>
              </div>
              <div className="space-y-2">
                 {data.sets?.map((set, i) => (
                    <div key={i} className="flex items-center gap-3 bg-neutral-900 p-3 rounded-2xl border border-neutral-800">
                       <span className="text-xs font-black italic text-neutral-600 w-4">#{i+1}</span>
                       <div className="flex-1 grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Reps</span>
                             <input 
                               type="number"
                               value={set.reps}
                               onChange={e => updateSet(i, 'reps', Math.max(0, parseInt(e.target.value) || 0))}
                               className="w-full bg-black border border-neutral-800 rounded-xl px-2 py-2 text-center font-bold text-xs"
                             />
                          </div>
                          <div className="space-y-1">
                             <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Carga</span>
                             <input 
                               type="number"
                               value={set.weight}
                               onChange={e => updateSet(i, 'weight', Math.max(0, parseFloat(e.target.value) || 0))}
                               className="w-full bg-black border border-neutral-800 rounded-xl px-2 py-2 text-center font-bold text-xs"
                             />
                          </div>
                       </div>
                       {data.sets!.length > 1 && (
                          <button onClick={() => removeSet(i)} className="p-2 text-neutral-700 hover:text-red-500"><Trash2 size={14} /></button>
                       )}
                    </div>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest px-1">Descanso (s)</label>
                 <input 
                    type="number"
                    value={data.restTime}
                    onChange={e => setData({ ...data, restTime: parseInt(e.target.value) || 0 })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-center font-black text-white"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest px-1">Ordem (Pos)</label>
                 <div className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl p-3 text-center font-black text-neutral-500">
                    --
                 </div>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest px-1">Observações</label>
              <textarea 
                 value={data.notes}
                 onChange={e => setData({ ...data, notes: e.target.value })}
                 className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-xs font-medium text-neutral-300 h-24 outline-none focus:border-red-600 resize-none"
                 placeholder="Foco na cadência ou técnica..."
              />
           </div>
        </div>

        <div className="p-6 bg-neutral-950 border-t border-neutral-900">
           <button 
              onClick={() => onSave(data)}
              className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl shadow-white/5"
           >
              Salvar Alterações
           </button>
        </div>
      </motion.div>
    </div>
  );
}
