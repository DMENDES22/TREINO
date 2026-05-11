import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Check, Clock, Edit3, X, Save, Trophy, Dumbbell, Play, Pause, RotateCcw, Plus, Target } from 'lucide-react';
import { EXERCISES } from '../data/exercises';
import { Workout, WorkoutExercise, Set, Session } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function ActiveWorkout({ plan, onFinish }: { plan?: Workout, onFinish: () => void }) {
  const { profile } = useAuth();
  const [sessionTitle, setSessionTitle] = useState(plan?.title || 'Treino de Hoje');
  const [exercises, setExercises] = useState<WorkoutExercise[]>(plan?.exercises || []);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Timer State
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [initialTime, setInitialTime] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save logic
  useEffect(() => {
    const saved = localStorage.getItem('active_workout');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Only resume if workout is less than 4 hours old
        if (Date.now() - data.savedAt < 4 * 60 * 60 * 1000) {
          if (confirm('Deseja retomar o treino anterior?')) {
            setExercises(data.exercises);
            setSessionTitle(data.sessionTitle);
            setStartTime(data.startTime);
          } else {
            localStorage.removeItem('active_workout');
          }
        }
      } catch (e) {
        console.error('Error loading saved workout:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (exercises.length > 0) {
      localStorage.setItem('active_workout', JSON.stringify({
        exercises,
        sessionTitle,
        startTime,
        savedAt: Date.now()
      }));
    }
  }, [exercises, sessionTitle, startTime]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const playAlert = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, context.currentTime); // A5
      
      gain.gain.setValueAtTime(0.1, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
      
      oscillator.connect(gain);
      gain.connect(context.destination);
      
      oscillator.start();
      oscillator.stop(context.currentTime + 0.5);

      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (e) {
      console.error('Audio alert failed:', e);
    }
  };

  useEffect(() => {
    if (showRestTimer && timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            playAlert();
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
  }, [timerActive, timeLeft, showRestTimer]);

  const startTimer = (seconds: number) => {
    setInitialTime(seconds);
    setTimeLeft(seconds);
    setTimerActive(true);
    setShowRestTimer(true);
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
    
    const wasCompleted = set.completed;
    set.completed = !wasCompleted;

    if (!wasCompleted) {
      startTimer(newExercises[exerciseIndex].restTime || 60);
    }
    
    setExercises(newExercises);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof Set, value: any) => {
    const newExercises = [...exercises];
    (newExercises[exerciseIndex].sets[setIndex] as any)[field] = value;
    setExercises(newExercises);
  };

  const addSet = (exerciseIndex: number) => {
    if (exercises[exerciseIndex].sets.length >= 8) return;
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
      localStorage.removeItem('active_workout');
      setIsFinishing(true);
      setTimeout(() => onFinish(), 2000);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${profile.uid}/sessions`);
    }
  };

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [lastStats, setLastStats] = useState<Record<string, { weight: number, reps: number, date: number }>>({});

  useEffect(() => {
    const fetchLastStats = async () => {
      if (!profile) return;
      try {
        const q = query(
          collection(db, `users/${profile.uid}/sessions`),
          orderBy('date', 'desc'),
          limit(20)
        );
        const querySnapshot = await getDocs(q);
        const stats: Record<string, { weight: number, reps: number, date: number }> = {};
        
        querySnapshot.forEach(doc => {
          const session = doc.data() as Session;
          session.exercises.forEach(ex => {
            if (!stats[ex.id]) {
              const bestSet = ex.sets.reduce((prev, curr) => (curr.weight > prev.weight) ? curr : prev, ex.sets[0]);
              stats[ex.id] = { weight: bestSet.weight, reps: bestSet.reps, date: session.date };
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
           className="w-32 h-32 bg-red-600 rounded-[40px] flex items-center justify-center mb-12 shadow-2xl shadow-red-600/30"
        >
           <Trophy size={64} className="text-white" />
        </motion.div>
        <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-4 text-center leading-none">TREINO<br/>FINALIZADO</h1>
        <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm text-center">Progresso garantido na nuvem.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white max-w-md mx-auto overflow-hidden font-sans relative">
      <div className="h-safe-top" />
      
      {/* Rest Timer Overlay - Immersive Mode */}
      <AnimatePresence>
        {showRestTimer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col pt-20"
          >
             {/* Focus Mode Background */}
             <div className="absolute inset-0 z-0 overflow-hidden px-6">
                <div className="absolute inset-0 bg-gradient-to-b from-red-600/20 to-black pointer-events-none" />
                <motion.div 
                   animate={{ 
                      scale: timerActive ? [1, 1.1, 1] : 1,
                      opacity: timerActive ? [0.1, 0.2, 0.1] : 0.1 
                   }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-red-600 rounded-full blur-[120px]" 
                />
             </div>

             <div className="relative z-10 flex flex-col h-full px-8">
                <div className="flex justify-between items-center mb-12">
                   <div>
                      <h2 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none mb-1">DESCANSE</h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Recupere sua força</p>
                   </div>
                   <button 
                      onClick={() => { if(confirm('Encerrar treino?')) handleFinish(); }}
                      className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-500"
                   >
                      Encerrar Treino
                   </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                   <motion.div 
                      key={timeLeft}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative"
                   >
                      <h3 className={`text-[130px] font-black tabular-nums italic leading-none tracking-tighter transition-colors ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                         {timeLeft}
                      </h3>
                      <span className="absolute -bottom-4 right-0 text-xl font-black italic text-neutral-600 tracking-tighter uppercase">seg</span>
                   </motion.div>
                </div>
                
                <div className="mb-16 space-y-8">
                   <div className="h-2 w-full bg-neutral-900/50 rounded-full overflow-hidden border border-neutral-800/50">
                      <motion.div 
                        initial={false}
                        animate={{ width: `${(timeLeft / initialTime) * 100}%` }}
                        className="h-full bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.6)]"
                      />
                   </div>

                   <div className="grid grid-cols-4 gap-3">
                      <button 
                         onClick={() => setTimeLeft(prev => prev + 15)}
                         className="bg-neutral-900 border border-neutral-800 h-20 rounded-[24px] flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
                      >
                         <Plus size={20} className="text-red-500" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">+15s</span>
                      </button>

                      <button 
                        onClick={() => setTimerActive(!timerActive)} 
                        className={`col-span-2 h-20 rounded-[32px] flex items-center justify-center gap-3 active:scale-95 transition-all ${timerActive ? 'bg-neutral-900 border border-neutral-800 text-white' : 'bg-red-600 text-white shadow-xl shadow-red-600/30'}`}
                      >
                        {timerActive ? (
                           <>
                              <Pause size={28} fill="currentColor" />
                              <span className="text-sm font-black uppercase italic tracking-widest">Pausar</span>
                           </>
                        ) : (
                           <>
                              <Play size={28} fill="currentColor" />
                              <span className="text-sm font-black uppercase italic tracking-widest">Continuar</span>
                           </>
                        )}
                      </button>

                      <button 
                         onClick={() => { setShowRestTimer(false); setTimerActive(false); }}
                         className="bg-neutral-900 border border-neutral-800 h-20 rounded-[24px] flex flex-col items-center justify-center gap-1 active:scale-95 transition-all overflow-hidden relative group"
                      >
                         <div className="absolute inset-0 bg-white/5 opacity-0 group-active:opacity-100 transition-opacity" />
                         <RotateCcw size={20} className="text-neutral-500" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Pular</span>
                      </button>
                   </div>
                </div>

                <div className="h-safe-bottom" />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="p-6 bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-40 border-b border-neutral-900">
         <div className="flex justify-between items-center mb-6">
            <button onClick={() => { if(confirm('Sair do treino? Seus dados estão salvos.')) onFinish(); }} className="w-10 h-10 bg-neutral-900 rounded-2xl flex items-center justify-center text-neutral-500 hover:text-white transition-colors">
               <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-0.5">Tempo Total</span>
               <span className="text-2xl font-black tabular-nums tracking-tighter italic leading-none">{formatTime(elapsedTime)}</span>
            </div>
            <button onClick={handleFinish} className="bg-red-600 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 active:scale-95 transition-all">
               Finalizar
            </button>
         </div>
         
         <div className="flex items-center justify-between gap-4">
            <input 
               value={sessionTitle}
               onChange={e => setSessionTitle(e.target.value)}
               className="flex-1 bg-transparent border-none text-2xl font-black italic uppercase tracking-tighter text-white focus:outline-none placeholder-neutral-800"
               placeholder="Treino Sem Título"
            />
            <button 
               onClick={() => setIsFocused(!isFocused)}
               className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isFocused ? 'bg-red-600' : 'bg-neutral-900 border border-neutral-800 text-neutral-500'}`}
               title="Modo Focado"
            >
               <Target size={20} />
            </button>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-12 pb-40">
         {exercises.map((ex, exIdx) => {
            const isVisible = !isFocused || (exercises.findIndex(e => e.sets.some(s => !s.completed)) === exIdx);
            if (!isVisible && isFocused) return null;

            return (
               <div key={exIdx} className="space-y-6">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center text-red-600">
                           <Dumbbell size={24} />
                        </div>
                        <div>
                           <h3 className="text-xl font-black italic tracking-tighter uppercase text-white leading-none mb-1">{ex.name}</h3>
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">{ex.category}</span>
                              {lastStats[ex.id] && (
                                 <span className="text-[9px] font-black text-red-600 bg-red-600/5 px-2 py-0.5 rounded-full border border-red-600/10 italic">
                                   ÚLTIMO: {lastStats[ex.id].weight}kg x {lastStats[ex.id].reps}
                                 </span>
                              )}
                           </div>
                        </div>
                     </div>
                     <button onClick={() => {
                        if(confirm('Remover exercício?')) {
                           const news = [...exercises];
                           news.splice(exIdx, 1);
                           setExercises(news);
                        }
                     }} className="text-neutral-700 hover:text-red-500 p-1"><X size={20} /></button>
                  </div>

                  <div className="space-y-3">
                     <div className="grid grid-cols-10 gap-2 text-[8px] font-black text-neutral-700 uppercase tracking-[0.2em] px-2 mb-1">
                        <div className="col-span-1 text-center">T</div>
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-4 text-center">PESO</div>
                        <div className="col-span-2 text-center">REPS</div>
                        <div className="col-span-2 text-center">OK</div>
                     </div>
                     
                     <AnimatePresence initial={false}>
                        {ex.sets.map((set, setIdx) => (
                           <motion.div 
                              layout
                              key={setIdx} 
                              className={`grid grid-cols-10 gap-2 items-center p-2 rounded-2xl transition-all border ${set.completed ? 'bg-red-600/5 border-red-600/20 opacity-60' : 'bg-neutral-900/50 border-neutral-800/50 shadow-lg'}`}
                           >
                              <div className="col-span-1 flex justify-center">
                                 <select 
                                 value={set.type} 
                                 onChange={(e) => updateSet(exIdx, setIdx, 'type', e.target.value)}
                                 className="bg-transparent text-[10px] font-black text-red-600 outline-none appearance-none text-center cursor-pointer font-italic"
                                 >
                                 <option value="A">A</option>
                                 <option value="P">P</option>
                                 <option value="V">V</option>
                                 </select>
                              </div>
                              <div className="col-span-1 text-center text-sm font-black text-white italic">#{setIdx + 1}</div>
                              <div className="col-span-4">
                                 <input 
                                 type="text" 
                                 inputMode="decimal"
                                 value={set.weight || ''} 
                                 onChange={e => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value.replace(',', '.')) || 0)}
                                 className="w-full bg-neutral-950 border border-neutral-800 text-white text-center font-black py-4 rounded-xl focus:border-red-600 outline-none text-lg transition-colors italic tracking-tighter"
                                 placeholder="0"
                                 />
                              </div>
                              <div className="col-span-2">
                                 <input 
                                 type="number" 
                                 value={set.reps || ''} 
                                 onChange={e => updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                                 className="w-full bg-neutral-950 border border-neutral-800 text-white text-center font-black py-4 rounded-xl focus:border-red-600 outline-none text-lg transition-colors italic tracking-tighter"
                                 placeholder="0"
                                 />
                              </div>
                              <div className="col-span-2 flex justify-center">
                                 <button 
                                 onClick={() => toggleSet(exIdx, setIdx)}
                                 className={`w-full h-14 rounded-xl flex items-center justify-center transition-all ${set.completed ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-neutral-800 border border-neutral-700 text-neutral-600'}`}
                                 >
                                 <Check size={20} strokeWidth={4} />
                                 </button>
                              </div>
                           </motion.div>
                        ))}
                     </AnimatePresence>
                  </div>
                  
                  {(!isFocused) && ex.sets.length < 8 && (
                     <button 
                        onClick={() => addSet(exIdx)}
                        className="w-full py-4 bg-neutral-950 text-neutral-600 font-black text-[10px] uppercase tracking-[0.2em] border border-dashed border-neutral-800 rounded-3xl hover:text-white transition-all hover:bg-neutral-900"
                     >
                        + Adicionar Série
                     </button>
                  )}
               </div>
            );
         })}
         
         {!isFocused && (
            <button 
               onClick={() => setShowExercisePicker(true)}
               className="w-full py-12 border-2 border-dashed border-neutral-800 rounded-[40px] text-neutral-600 flex flex-col items-center justify-center gap-4 hover:text-white hover:border-red-600/30 transition-all group bg-neutral-900/10 active:scale-98"
            >
               <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                  <Plus size={24} />
               </div>
               <span className="font-black uppercase tracking-[0.3em] text-[10px]">Novo Exercício</span>
            </button>
         )}
      </main>

      <AnimatePresence>
        {showExercisePicker && (
          <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md p-6">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-neutral-950 border border-neutral-800 h-full rounded-[40px] flex flex-col overflow-hidden max-w-md mx-auto shadow-2xl"
             >
                <div className="p-8 border-b border-neutral-900 flex justify-between items-center">
                   <h3 className="text-2xl font-black italic text-white uppercase italic tracking-tighter">EXERCÍCIOS</h3>
                   <button onClick={() => setShowExercisePicker(false)} className="w-10 h-10 bg-neutral-900 rounded-2xl flex items-center justify-center text-white"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                   {EXERCISES.map(ex => (
                      <button 
                        key={ex.id}
                        onClick={() => { addExercise(ex.id); setShowExercisePicker(false); }}
                        className="w-full text-left bg-neutral-900/50 p-6 rounded-[32px] flex items-center justify-between group active:scale-95 transition-all border border-neutral-900 hover:border-red-600/30"
                      >
                         <div>
                            <h4 className="font-black text-white uppercase tracking-tight text-lg mb-0.5">{ex.name}</h4>
                            <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">{ex.category}</span>
                         </div>
                         <div className="w-8 h-8 bg-neutral-800 rounded-xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                           <Plus size={16} />
                         </div>
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
