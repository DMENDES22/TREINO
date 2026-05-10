import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, Clock, Edit3, X, Save, Trophy, Dumbbell, Play, Pause, RotateCcw, Plus } from 'lucide-react';
import { EXERCISES } from '../data/exercises';
import { WorkoutExercise, Set, Session } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function ActiveWorkout({ onFinish }: { onFinish: () => void }) {
  const { profile } = useAuth();
  const [sessionTitle, setSessionTitle] = useState('Treino de Hoje');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  
  // Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [initialTime, setInitialTime] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  const startTimer = (seconds: number) => {
    setInitialTime(seconds);
    setTimeLeft(seconds);
    setTimerActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addExercise = (exerciseId: string) => {
    const exercise = EXERCISES.find(e => e.id === exerciseId);
    if (!exercise) return;

    const newExercise: WorkoutExercise = {
      ...exercise,
      sets: [{ reps: 0, weight: 0, completed: false, type: 'V' }],
      restTime: 60,
      notes: ''
    };
    setExercises([...exercises, newExercise]);
  };

  const toggleSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    const set = newExercises[exerciseIndex].sets[setIndex];
    
    if (!set.completed) {
      startTimer(newExercises[exerciseIndex].restTime);
    }
    
    set.completed = !set.completed;
    setExercises(newExercises);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof Set, value: any) => {
    const newExercises = [...exercises];
    (newExercises[exerciseIndex].sets[setIndex] as any)[field] = value;
    setExercises(newExercises);
  };

  const addSet = (exerciseIndex: number) => {
    if (exercises[exerciseIndex].sets.length >= 6) return;
    const newExercises = [...exercises];
    const lastSet = newExercises[exerciseIndex].sets[newExercises[exerciseIndex].sets.length - 1];
    newExercises[exerciseIndex].sets.push({
      reps: lastSet?.reps || 0,
      weight: lastSet?.weight || 0,
      completed: false,
      type: 'V'
    });
    setExercises(newExercises);
  };

  const handleFinish = async () => {
    if (!profile) return;
    const totalVolume = exercises.reduce((acc, ex) => 
      acc + ex.sets.reduce((sAcc, s) => s.completed ? sAcc + (s.weight * s.reps) : sAcc, 0)
    , 0);

    const session: Partial<Session> = {
      userId: profile.uid,
      title: sessionTitle,
      date: Date.now(),
      exercises: exercises.filter(ex => ex.sets.some(s => s.completed)),
      duration: Math.floor(elapsedTime / 60),
      totalVolume
    };

    try {
      await addDoc(collection(db, `users/${profile.uid}/sessions`), session);
      setIsFinishing(true);
      setTimeout(() => onFinish(), 2000);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${profile.uid}/sessions`);
    }
  };

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [lastStats, setLastStats] = useState<Record<string, { weight: number, reps: number }>>({});

  useEffect(() => {
    const fetchLastStats = async () => {
      if (!profile) return;
      try {
        const q = query(
          collection(db, `users/${profile.uid}/sessions`),
          orderBy('date', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const stats: Record<string, { weight: number, reps: number }> = {};
        
        querySnapshot.forEach(doc => {
          const session = doc.data() as Session;
          session.exercises.forEach(ex => {
            if (!stats[ex.id]) {
              const bestSet = ex.sets.reduce((prev, curr) => (curr.weight > prev.weight) ? curr : prev, ex.sets[0]);
              stats[ex.id] = { weight: bestSet.weight, reps: bestSet.reps };
            }
          });
        });
        setLastStats(stats);
      } catch (e) {
        console.error('Error fetching last stats:', e);
      }
    };
    fetchLastStats();
  }, [profile]);

  if (isFinishing) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-8">
        <motion.div 
           initial={{ scale: 0.5, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-500/30"
        >
           <Trophy size={48} className="text-white" />
        </motion.div>
        <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">TREINO CONCLUÍDO!</h1>
        <p className="text-neutral-500 font-bold uppercase tracking-widest text-center">Salvando seus ganhos na nuvem...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white max-w-md mx-auto overflow-hidden">
      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {timerActive && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 p-4 bg-neutral-950 border-b border-neutral-800 shadow-2xl"
          >
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <Clock className="text-red-600" size={20} />
                   <span className="text-3xl font-black tabular-nums italic text-white leading-none">{formatTime(timeLeft)}</span>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setTimerActive(!timerActive)} className="p-2 bg-neutral-900 rounded-xl text-white">
                      {timerActive ? <Pause size={20} /> : <Play size={20} />}
                   </button>
                   <button onClick={() => { setTimeLeft(initialTime); setTimerActive(false); }} className="p-2 bg-neutral-900 rounded-xl text-white">
                      <RotateCcw size={20} />
                   </button>
                   <button onClick={() => setTimerActive(false)} className="p-2 bg-red-600 rounded-xl text-white">
                      <X size={20} />
                   </button>
                </div>
             </div>
             <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={false}
                  animate={{ width: `${(timeLeft / initialTime) * 100}%` }}
                  className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                />
             </div>
             <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
                {[60, 90, 120, 150, 180].map(s => (
                   <button 
                     key={s} 
                     onClick={() => startTimer(s)}
                     className="flex-shrink-0 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-[10px] font-black uppercase text-neutral-400 hover:text-white"
                   >
                      {Math.floor(s / 60)}:{(s % 60).toString().padStart(2, '0')}
                   </button>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="p-6 bg-neutral-900/50 backdrop-blur-xl sticky top-0 z-20 border-b border-neutral-800">
         <div className="flex justify-between items-center mb-4">
            <button onClick={() => { if(confirm('Cancelar treino atual?')) onFinish(); }} className="text-neutral-500 hover:text-white transition-colors">
               <X size={24} />
            </button>
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Duração</span>
               <span className="text-xl font-black tabular-nums tracking-tight">{formatTime(elapsedTime)}</span>
            </div>
            <button onClick={handleFinish} className="bg-green-600 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-green-600/20">
               Finalizar
            </button>
         </div>
         <input 
            value={sessionTitle}
            onChange={e => setSessionTitle(e.target.value)}
            className="w-full bg-transparent border-none text-2xl font-black italic uppercase tracking-tighter text-white focus:outline-none placeholder-neutral-700"
            placeholder="Título do Treino"
         />
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">
         <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black uppercase text-neutral-600 tracking-[0.2em]">Exercícios</h3>
            <button 
               onClick={async () => {
                  if (!profile) return;
                  const q = query(collection(db, `users/${profile.uid}/sessions`), orderBy('date', 'desc'), limit(1));
                  const snapshot = await getDocs(q);
                  if (!snapshot.empty) {
                     const last = snapshot.docs[0].data() as Session;
                     setExercises(last.exercises.map(ex => ({
                        ...ex,
                        sets: ex.sets.map(s => ({ ...s, completed: false }))
                     })));
                  }
               }}
               className="text-[9px] font-bold text-red-500 hover:text-red-400 uppercase tracking-widest italic"
            >
               Copiar Último Treino
            </button>
         </div>

         {exercises.map((ex, exIdx) => (
            <div key={exIdx} className="space-y-4">
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                        <Dumbbell className="text-red-500" size={24} />
                     </div>
                     <div>
                        <h3 className="font-extrabold text-white uppercase tracking-tight leading-none">{ex.name}</h3>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{ex.category}</span>
                           {lastStats[ex.id] && (
                              <span className="text-[9px] font-bold text-red-500/80 bg-red-600/5 px-1.5 py-0.5 rounded border border-red-600/10 italic">
                                ÚLTIMO: {lastStats[ex.id].weight}kg x {lastStats[ex.id].reps}
                              </span>
                           )}
                        </div>
                     </div>
                  </div>
                  <button onClick={() => {
                     const news = [...exercises];
                     news.splice(exIdx, 1);
                     setExercises(news);
                  }} className="text-neutral-600 hover:text-red-500"><X size={18} /></button>
               </div>

               <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-1 text-[7px] font-black text-neutral-600 uppercase tracking-widest px-2">
                     <div className="col-span-1 text-center">T</div>
                     <div className="col-span-1 text-center">#</div>
                     <div className="col-span-3 text-center">KG</div>
                     <div className="col-span-3 text-center">REPS</div>
                     <div className="col-span-2 text-center">RPE</div>
                     <div className="col-span-2 text-center">OK</div>
                  </div>
                  
                  {ex.sets.map((set, setIdx) => (
                     <div key={setIdx} className={`grid grid-cols-12 gap-1 items-center p-1.5 rounded-xl transition-all ${set.completed ? 'bg-red-600/10 border border-red-600/20' : 'bg-neutral-900 border border-neutral-800'}`}>
                        <div className="col-span-1 flex justify-center">
                           <select 
                             value={set.type} 
                             onChange={(e) => updateSet(exIdx, setIdx, 'type', e.target.value)}
                             className="bg-transparent text-[10px] font-black text-red-600 outline-none appearance-none text-center cursor-pointer"
                           >
                              <option value="A">A</option>
                              <option value="P">P</option>
                              <option value="V">V</option>
                           </select>
                        </div>
                        <div className="col-span-1 text-center text-xs font-black text-white italic">#{setIdx + 1}</div>
                        <div className="col-span-3">
                           <input 
                             type="number" 
                             value={set.weight || ''} 
                             onChange={e => updateSet(exIdx, setIdx, 'weight', Number(e.target.value))}
                             className="w-full bg-neutral-800 text-white text-center font-bold py-2 rounded-lg focus:ring-1 focus:ring-red-600 outline-none text-xs"
                             placeholder="0"
                           />
                        </div>
                        <div className="col-span-3">
                           <input 
                             type="number" 
                             value={set.reps || ''} 
                             onChange={e => updateSet(exIdx, setIdx, 'reps', Number(e.target.value))}
                             className="w-full bg-neutral-800 text-white text-center font-bold py-2 rounded-lg focus:ring-1 focus:ring-red-600 outline-none text-xs"
                             placeholder="0"
                           />
                        </div>
                        <div className="col-span-2">
                           <input 
                             type="number" 
                             value={set.rpe || ''} 
                             onChange={e => updateSet(exIdx, setIdx, 'rpe', Number(e.target.value))}
                             className="w-full bg-neutral-800 text-red-500 text-center font-black py-2 rounded-lg focus:ring-1 focus:ring-red-600 outline-none text-xs"
                             placeholder="-"
                           />
                        </div>
                        <div className="col-span-2 flex justify-center">
                           <button 
                             onClick={() => toggleSet(exIdx, setIdx)}
                             className={`w-full h-8 rounded-lg flex items-center justify-center transition-all ${set.completed ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-neutral-800 text-neutral-600'}`}
                           >
                              <Check size={14} strokeWidth={4} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
               {ex.sets.length < 6 && (
                  <button 
                    onClick={() => addSet(exIdx)}
                    className="w-full py-2 bg-neutral-900 text-neutral-600 font-black text-[10px] uppercase tracking-widest border border-dashed border-neutral-800 rounded-xl hover:text-white transition-colors"
                  >
                     + Adicionar Série
                  </button>
               )}
            </div>
         ))}
         
         <button 
            onClick={() => setShowExercisePicker(true)}
            className="w-full py-16 border-2 border-dashed border-neutral-800 rounded-[40px] text-neutral-600 flex flex-col items-center justify-center gap-3 hover:text-red-500 hover:border-red-600/30 transition-all group bg-neutral-900/20"
         >
            <div className="p-4 bg-neutral-900 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all">
               <Plus size={32} />
            </div>
            <span className="font-black uppercase tracking-widest text-[10px]">Adicionar Exercício</span>
         </button>
      </main>

      <AnimatePresence>
        {showExercisePicker && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4">
             <motion.div 
               initial={{ y: 100, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 100, opacity: 0 }}
               className="bg-neutral-950 border border-neutral-800 h-full rounded-[40px] flex flex-col overflow-hidden max-w-md mx-auto"
             >
                <div className="p-6 border-b border-neutral-900 flex justify-between items-center">
                   <h3 className="text-xl font-black italic text-white uppercase italic">LISTA DE EXERCÍCIOS</h3>
                   <button onClick={() => setShowExercisePicker(false)} className="p-2 hover:bg-neutral-900 rounded-full text-white"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   {EXERCISES.map(ex => (
                      <button 
                        key={ex.id}
                        onClick={() => { addExercise(ex.id); setShowExercisePicker(false); }}
                        className="w-full text-left bg-neutral-900 p-4 rounded-2xl flex items-center justify-between group active:scale-95 transition-all border border-transparent hover:border-red-600/30"
                      >
                         <div>
                            <h4 className="font-extrabold text-white uppercase tracking-tight">{ex.name}</h4>
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
