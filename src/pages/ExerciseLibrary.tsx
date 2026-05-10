import React, { useState } from 'react';
import { EXERCISES } from '../data/exercises';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Info, X, Play, Dumbbell } from 'lucide-react';
import { Exercise, MuscleGroup } from '../types';

export default function ExerciseLibrary() {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'Todos'>('Todos');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const muscles: (MuscleGroup | 'Todos')[] = [
    'Todos', 'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Abdômen', 'Panturrilha', 'Antebraço'
  ];

  const filtered = EXERCISES.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle === 'Todos' || ex.category === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="h-full flex flex-col pt-2">
      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar exercício..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 font-bold focus:border-red-600 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {muscles.map(m => (
            <button 
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all ${selectedMuscle === m ? 'bg-red-600 text-white' : 'bg-neutral-900 text-neutral-500 border border-neutral-800'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-1">
        {filtered.map(ex => (
          <motion.div 
            layout
            key={ex.id}
            onClick={() => setSelectedExercise(ex)}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-4 active:scale-98 cursor-pointer transition-transform"
          >
             <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center p-2">
                <Dumbbell className="text-red-500 opacity-50" size={24} />
             </div>
             <div className="flex-1">
                <h4 className="font-extrabold text-white uppercase tracking-tight">{ex.name}</h4>
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">{ex.category} • {ex.equipment}</p>
             </div>
             <Info className="text-neutral-600" size={20} />
          </motion.div>
        ))}
      </div>

      {/* Exercise Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-neutral-900 w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden border border-neutral-800 max-h-[90vh] flex flex-col shadow-2xl"
            >
              <div className="relative h-24 bg-neutral-800 flex items-center justify-center p-4">
                <button onClick={() => setSelectedExercise(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full backdrop-blur-md z-10">
                  <X size={20} />
                </button>
                <Dumbbell size={40} className="text-red-500 opacity-20" />
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-neutral-900 to-transparent" />
              </div>

              <div className="p-8 space-y-6 overflow-y-auto">
                 <div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">{selectedExercise.name}</h2>
                    <div className="flex gap-2 mt-2">
                       <span className="bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">{selectedExercise.category}</span>
                       <span className="bg-neutral-800 text-neutral-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">{selectedExercise.equipment}</span>
                    </div>
                 </div>

                 <section className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-red-500">Execução Correta</h3>
                    <ul className="space-y-4">
                       {selectedExercise.instructions.map((inst, i) => (
                         <li key={i} className="flex gap-4">
                            <span className="text-neutral-700 font-black italic text-2xl leading-none">{i+1}</span>
                            <p className="text-sm font-bold text-neutral-300 leading-snug">{inst}</p>
                         </li>
                       ))}
                    </ul>
                 </section>

                 <section className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-red-500">Músculos Ativados</h3>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold text-neutral-500">
                       {selectedExercise.muscles.map(m => (
                         <span key={m} className="border border-neutral-800 px-3 py-1 rounded-full uppercase">{m}</span>
                       ))}
                    </div>
                 </section>

                 <button className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                    ADICIONAR AO MEU TREINO
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
