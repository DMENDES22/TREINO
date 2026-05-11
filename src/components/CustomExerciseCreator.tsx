import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, X, Save, Dumbbell, Clock, Type, FileText, Camera } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { collection, addDoc } from 'firebase/firestore';
import { MuscleGroup } from '../types';

export default function CustomExerciseCreator({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Peito' as MuscleGroup,
    description: '',
    weight: 0,
    sets: 3,
    reps: 12,
    restTime: 60
  });

  const muscleGroups: MuscleGroup[] = [
    'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Abdômen', 'Panturrilha', 'Antebraço'
  ];

  const handleSubmit = async () => {
    if (!formData.name || !user) return;

    try {
      const exerciseData = {
        ...formData,
        id: `custom_${Date.now()}`,
        userId: user.uid,
        isCustom: true,
        instructions: [formData.description],
        muscles: [formData.category],
        equipment: 'Personalizado',
        gifUrl: ''
      };

      await addDoc(collection(db, 'custom_exercises'), exerciseData);
      alert('Exercício criado com sucesso!');
      onCreated();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'custom_exercises');
    }
  };

  return (
    <div className="space-y-6 pt-2 pb-24">
      <header className="mb-4">
        <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">Novo Exercício Personalizado</h2>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Crie sua própria rotina de treino</p>
      </header>

      <div className="space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
           <div>
              <div className="flex items-center gap-2 mb-2">
                 <Type size={14} className="text-red-500" />
                 <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Nome do Exercício</label>
              </div>
              <input 
                 value={formData.name}
                 onChange={e => setFormData({ ...formData, name: e.target.value })}
                 className="w-full bg-black border border-neutral-800 rounded-2xl px-4 py-4 font-bold text-white focus:border-red-600 outline-none"
                 placeholder="Ex: Supino Articulado"
              />
           </div>

           <div>
              <div className="flex items-center gap-2 mb-2">
                 <Dumbbell size={14} className="text-red-500" />
                 <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Grupo Muscular</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 {muscleGroups.map(group => (
                    <button 
                       key={group}
                       onClick={() => setFormData({ ...formData, category: group })}
                       className={`py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border transition-all ${formData.category === group ? 'bg-red-600/10 border-red-600 text-red-500' : 'bg-black border-neutral-800 text-neutral-500'}`}
                    >
                       {group}
                    </button>
                 ))}
              </div>
           </div>

           <div>
              <div className="flex items-center gap-2 mb-2">
                 <FileText size={14} className="text-red-500" />
                 <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Descrição / Notas</label>
              </div>
              <textarea 
                 value={formData.description}
                 onChange={e => setFormData({ ...formData, description: e.target.value })}
                 className="w-full bg-black border border-neutral-800 rounded-2xl px-4 py-4 font-medium text-sm text-neutral-300 focus:border-red-600 outline-none h-24 resize-none"
                 placeholder="Como executar ou observações..."
              />
           </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Carga (kg)</label>
                 <input 
                    type="number"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 font-bold text-white text-center"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Séries</label>
                 <input 
                    type="number"
                    value={formData.sets}
                    onChange={e => setFormData({ ...formData, sets: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 font-bold text-white text-center"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Reps</label>
                 <input 
                    type="number"
                    value={formData.reps}
                    onChange={e => setFormData({ ...formData, reps: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 font-bold text-white text-center"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Descanso (s)</label>
                 <input 
                    type="number"
                    value={formData.restTime}
                    onChange={e => setFormData({ ...formData, restTime: Number(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 font-bold text-white text-center"
                 />
              </div>
           </div>
        </div>

        <button 
           onClick={handleSubmit}
           disabled={!formData.name}
           className="w-full bg-red-600 py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
           <Save size={20} /> Salvar Exercício
        </button>
      </div>
    </div>
  );
}
