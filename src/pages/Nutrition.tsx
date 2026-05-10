import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, 
  Utensils, 
  Cookie, 
  Moon, 
  Sparkles, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Settings, 
  History, 
  Zap, 
  Target,
  Flame,
  Scale,
  Brain
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { Meal, MealCategory, DailyMacros, NutritionalGoal, DietStrategy } from '../types';
import { calculateMacros, calculateCycleMacros } from '../lib/nutritionUtils';
import { analyzeMeal } from '../services/nutritionService';

type NutritionTab = 'diary' | 'meals' | 'strategies';

export default function Nutrition() {
  const { profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<NutritionTab>('diary');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showStrategyPicker, setShowStrategyPicker] = useState(false);
  const [showCyclePicker, setShowCyclePicker] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('Almoço');
  const [selectedDate, setSelectedDate] = useState(new Date().setHours(0, 0, 0, 0));

  const goals: NutritionalGoal[] = ['Manutenção', 'Cutting', 'Bulking Limpo'];
  const strategies: DietStrategy[] = ['Dieta Constante', 'Ciclo de Carboidratos'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (profile) {
      fetchMeals();
    }
  }, [profile, selectedDate]);

  const fetchMeals = async () => {
    if (!profile) return;
    try {
      const q = query(
        collection(db, `users/${profile.uid}/meals`),
        where('date', '==', selectedDate),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      const mealsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal));
      setMeals(mealsData);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'meals');
    }
  };

  const handleAddMealAI = async () => {
    if (!aiPrompt.trim() || !profile) return;
    setLoading(true);
    try {
      const result = await analyzeMeal(aiPrompt);
      const newMeal: Omit<Meal, 'id'> = {
        userId: profile.uid,
        date: selectedDate,
        name: result.name,
        category: selectedCategory,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        weight: result.weight
      };
      await addDoc(collection(db, `users/${profile.uid}/meals`), newMeal);
      setAiPrompt('');
      setIsAddingMeal(false);
      fetchMeals();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getDayLabel = (date: number) => {
    const today = new Date().setHours(0, 0, 0, 0);
    if (date === today) return 'Hoje';
    return new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  // Calculate consumed macros
  const consumed = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Get current target macros for the day (considering cycle)
  const getTargetMacros = (): DailyMacros => {
    if (!profile?.baseMacros) {
       // If not set, return dummy or calculate now if enough data
       if (profile && profile.weight && profile.height && profile.age) {
          return calculateMacros(profile);
       }
       return { calories: 2000, protein: 150, carbs: 200, fat: 60 };
    }
    
    if (profile.dietStrategy === 'Ciclo de Carboidratos' && profile.carbCycleConfig) {
      const dayNames: Record<number, string> = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
      const dayOfWeek = new Date(selectedDate).getDay();
      const intensity = profile.carbCycleConfig[dayNames[dayOfWeek]] || 'Medium';
      return calculateCycleMacros(profile.baseMacros, intensity);
    }
    
    return profile.baseMacros;
  };

  const targetMacros = getTargetMacros();

  return (
    <div className="space-y-6 pb-24">
      {/* Date Selector */}
      <div className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-2xl p-4">
        <button onClick={() => setSelectedDate(d => d - 86400000)} className="p-2 hover:bg-neutral-900 rounded-xl transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h2 className="font-black text-xs uppercase tracking-widest text-neutral-500">{getDayLabel(selectedDate)}</h2>
          {profile?.dietStrategy === 'Ciclo de Carboidratos' && (
            <span className="text-[10px] font-bold text-red-500 uppercase italic">
              Ciclo: {profile.carbCycleConfig?.[Object.keys(profile.carbCycleConfig)[new Date(selectedDate).getDay()]] || 'Medium'}
            </span>
          )}
        </div>
        <button onClick={() => setSelectedDate(d => d + 86400000)} className="p-2 hover:bg-neutral-900 rounded-xl transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-neutral-950 p-1 rounded-2xl border border-neutral-800">
        <TabButton active={activeTab === 'diary'} onClick={() => setActiveTab('diary')} label="Diário" icon={<Zap size={14} />} />
        <TabButton active={activeTab === 'meals'} onClick={() => setActiveTab('meals')} label="Refeições" icon={<History size={14} />} />
        <TabButton active={activeTab === 'strategies'} onClick={() => setActiveTab('strategies')} label="Estratégias" icon={<Settings size={14} />} />
      </div>

      {activeTab === 'diary' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Macro Rings / Summary */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="text-3xl font-black italic text-white leading-none">
                    {Math.round(targetMacros.calories - consumed.calories)}
                  </h3>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-1">Calorias Restantes</p>
               </div>
               <div className="text-right">
                  <h3 className="text-lg font-black text-neutral-300 leading-none">{consumed.calories}</h3>
                  <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mt-1">Consumidas</p>
               </div>
            </div>

            <div className="space-y-4">
              <MacroBar label="Proteína" current={consumed.protein} target={targetMacros.protein} color="bg-red-600" unit="g" />
              <MacroBar label="Carboidrato" current={consumed.carbs} target={targetMacros.carbs} color="bg-orange-500" unit="g" />
              <MacroBar label="Gordura" current={consumed.fat} target={targetMacros.fat} color="bg-yellow-500" unit="g" />
            </div>
          </section>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5">
              <Scale size={20} className="text-neutral-500 mb-3" />
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Peso Atual</p>
              <h4 className="text-xl font-black text-white italic">{profile?.weight}kg</h4>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5">
              <Target size={20} className="text-red-500 mb-3" />
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Peso Meta</p>
              <h4 className="text-xl font-black text-white italic">{profile?.targetWeight || '--'}kg</h4>
            </div>
          </div>

          {/* Add Meal FAB */}
          <button 
            onClick={() => setIsAddingMeal(true)}
            className="w-full bg-red-600 py-6 rounded-3xl flex items-center justify-center gap-3 shadow-xl shadow-red-600/20 active:scale-[0.98] transition-all group"
          >
            <Plus size={24} className="group-hover:rotate-90 transition-transform" />
            <span className="font-black uppercase italic tracking-tighter">Adicionar Refeição IA</span>
          </button>
        </motion.div>
      )}

      {activeTab === 'meals' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black uppercase text-neutral-600 tracking-[0.2em]">Histórico do Dia</h3>
            <span className="text-[10px] font-bold text-neutral-500">{meals.length} Refeições</span>
          </div>

          {meals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <Utensils size={48} className="mb-4" />
              <p className="font-bold uppercase tracking-widest text-xs">Nenhuma refeição logada</p>
            </div>
          ) : (
            meals.map((meal) => (
              <div key={meal.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center text-red-500">
                    <CategoryIcon category={meal.category} />
                  </div>
                  <div>
                    <h4 className="font-black text-white uppercase tracking-tight text-sm">{meal.name}</h4>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{meal.category} • {meal.weight}g</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black italic text-red-500 leading-none">{meal.calories}</span>
                  <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">KCAL</p>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {activeTab === 'strategies' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-6 flex items-center gap-2">
              <Target size={20} className="text-red-500" />
              Configuração Nutricional
            </h3>
            
            <div className="space-y-4">
              <StrategyItem 
                label="Objetivo Nutricional" 
                value={profile?.nutritionalGoal || 'Não Definido'} 
                onClick={() => setShowGoalPicker(true)} 
              />
              <StrategyItem 
                label="Estratégia de Dieta" 
                value={profile?.dietStrategy || 'Não Definido'} 
                onClick={() => setShowStrategyPicker(true)} 
              />
              
              {profile?.dietStrategy === 'Ciclo de Carboidratos' && (
                <StrategyItem 
                  label="Configurar Ciclo" 
                  value="Ajustar Dias Semanais" 
                  onClick={() => setShowCyclePicker(true)} 
                />
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
                <div>
                  <label className="text-[10px] font-black text-neutral-600 uppercase mb-2 block">Peso Meta (KG)</label>
                  <input 
                    type="number" 
                    value={profile?.targetWeight || ''} 
                    onChange={async (e) => {
                      const val = Number(e.target.value);
                      if (updateProfile) await updateProfile({ targetWeight: val });
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 font-bold text-white focus:border-red-600 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-neutral-600 uppercase mb-2 block">Cálculo Base</label>
                  <div className="bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 font-bold text-neutral-400 text-sm">
                    Mifflin-St Jeor
                  </div>
                </div>
              </div>

              <button 
                onClick={async () => {
                  if (profile && updateProfile) {
                    const macros = calculateMacros(profile);
                    await updateProfile({ baseMacros: macros });
                  }
                }}
                className="w-full bg-neutral-800 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-300 mt-4"
              >
                Recalcular Macros Sugeridos
              </button>
            </div>
          </section>

          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-6 flex items-center gap-2">
              <Flame size={20} className="text-orange-500" />
              Macros Atuais
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <MacroCard label="Prot" value={`${targetMacros.protein}g`} icon={<DumbbellIcon />} />
              <MacroCard label="Carb" value={`${targetMacros.carbs}g`} icon={<Zap size={14}/>} />
              <MacroCard label="Gord" value={`${targetMacros.fat}g`} icon={<Flame size={14}/>} />
            </div>
          </section>
        </motion.div>
      )}

      {/* Add Meal Modal */}
      <AnimatePresence>
        {isAddingMeal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddingMeal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-neutral-950 rounded-t-[40px] z-[70] p-8 pb-12 overflow-y-auto max-h-[90vh]"
            >
              <div className="w-12 h-1.5 bg-neutral-800 rounded-full mx-auto mb-8" />
              
              <h2 className="text-2xl font-black italic text-white uppercase mb-6">O que você comeu?</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-5 gap-2">
                  <CategoryBtn active={selectedCategory === 'Café da Manhã'} onClick={() => setSelectedCategory('Café da Manhã')} icon={<Coffee size={18} />} label="Café" />
                  <CategoryBtn active={selectedCategory === 'Almoço'} onClick={() => setSelectedCategory('Almoço')} icon={<Utensils size={18} />} label="Almoço" />
                  <CategoryBtn active={selectedCategory === 'Lanche'} onClick={() => setSelectedCategory('Lanche')} icon={<Cookie size={18} />} label="Lanche" />
                  <CategoryBtn active={selectedCategory === 'Janta'} onClick={() => setSelectedCategory('Janta')} icon={<Moon size={18} />} label="Janta" />
                  <CategoryBtn active={selectedCategory === 'Ceia'} onClick={() => setSelectedCategory('Ceia')} icon={<Sparkles size={18} />} label="Ceia" />
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4">
                  <textarea 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Descreva sua refeição... (Ex: 2 ovos fritos, 200g de arroz integral e um bife de frango)"
                    className="w-full bg-transparent text-white font-bold placeholder:text-neutral-700 outline-none resize-none h-32"
                  />
                  <div className="flex justify-end pt-2">
                     <Brain size={16} className="text-red-500 animate-pulse" />
                  </div>
                </div>

                <button 
                  onClick={handleAddMealAI}
                  disabled={loading || !aiPrompt.trim()}
                  className="w-full bg-red-600 py-5 rounded-3xl font-black uppercase italic tracking-tighter disabled:opacity-50 disabled:grayscale transition-all"
                >
                  {loading ? 'Analisando com IA...' : 'Salvar com IA'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Goal Picker */}
      <PickerModal 
        show={showGoalPicker} 
        onClose={() => setShowGoalPicker(false)} 
        title="Objetivo Nutricional"
        options={goals}
        selected={profile?.nutritionalGoal}
        onSelect={async (val) => {
          if (updateProfile) await updateProfile({ nutritionalGoal: val as NutritionalGoal });
          setShowGoalPicker(false);
        }}
      />

      {/* Strategy Picker */}
      <PickerModal 
        show={showStrategyPicker} 
        onClose={() => setShowStrategyPicker(false)} 
        title="Estratégia de Dieta"
        options={strategies}
        selected={profile?.dietStrategy}
        onSelect={async (val) => {
          if (updateProfile) await updateProfile({ dietStrategy: val as DietStrategy });
          setShowStrategyPicker(false);
        }}
      />

      {/* Cycle Picker */}
      <AnimatePresence>
        {showCyclePicker && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCyclePicker(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 bg-neutral-950 rounded-t-[40px] z-[90] p-8 pb-12">
              <h2 className="text-xl font-black italic text-white uppercase mb-6">Ciclo de Carboidratos</h2>
              <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-2">
                {daysOfWeek.map(day => (
                  <div key={day} className="flex items-center justify-between p-4 bg-neutral-900 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-neutral-400">{day}</span>
                    <div className="flex gap-1">
                      {(['Low', 'Medium', 'High'] as const).map(intensity => (
                        <button 
                          key={intensity}
                          onClick={async () => {
                            if (profile && updateProfile) {
                              const newConfig = { ...(profile.carbCycleConfig || {}), [day]: intensity };
                              await updateProfile({ carbCycleConfig: newConfig });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${profile?.carbCycleConfig?.[day] === intensity ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-600'}`}
                        >
                          {intensity}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowCyclePicker(false)} className="w-full bg-neutral-800 py-4 rounded-2xl font-bold uppercase text-[10px] mt-6 tracking-widest">Fechar</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const PickerModal = ({ show, onClose, title, options, selected, onSelect }: { show: boolean, onClose: () => void, title: string, options: string[], selected?: string, onSelect: (val: string) => void }) => (
  <AnimatePresence>
    {show && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80]" />
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 bg-neutral-950 rounded-t-[40px] z-[90] p-8 pb-12">
          <h2 className="text-xl font-black italic text-white uppercase mb-6">{title}</h2>
          <div className="space-y-2">
            {options.map(opt => (
              <button 
                key={opt}
                onClick={() => onSelect(opt)}
                className={`w-full p-5 rounded-2xl text-left font-black uppercase text-xs transition-all ${selected === opt ? 'bg-red-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'}`}
              >
                {opt}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="w-full bg-neutral-800 py-4 rounded-2xl font-bold uppercase text-[10px] mt-6 tracking-widest">Fechar</button>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const TabButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${active ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-neutral-500 hover:text-neutral-300'}`}
  >
    {icon} {label}
  </button>
);

const MacroBar = ({ label, current, target, color, unit }: { label: string, current: number, target: number, color: string, unit: string }) => {
  const percent = Math.min((current / target) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-white">
          {Math.round(current)}{unit} <span className="text-neutral-600 font-black">/ {Math.round(target)}{unit}</span>
        </span>
      </div>
      <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
};

const StrategyItem = ({ label, value, onClick }: { label: string, value: string, onClick: () => void }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between py-4 border-b border-neutral-800 last:border-0 group">
    <div>
      <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1 text-left">{label}</p>
      <h4 className="font-black text-white text-sm uppercase tracking-tight group-hover:text-red-500 transition-colors">{value}</h4>
    </div>
    <ChevronRight size={16} className="text-neutral-700" />
  </button>
);

const MacroCard = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
  <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col items-center gap-1">
    <div className="text-neutral-500 mb-1">{icon}</div>
    <p className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.2em]">{label}</p>
    <h5 className="font-black text-white text-xs whitespace-nowrap">{value}</h5>
  </div>
);

const CategoryIcon = ({ category }: { category: MealCategory }) => {
  switch (category) {
    case 'Café da Manhã': return <Coffee size={20} />;
    case 'Almoço': return <Utensils size={20} />;
    case 'Lanche': return <Cookie size={20} />;
    case 'Janta': return <Moon size={20} />;
    case 'Ceia': return <Sparkles size={20} />;
    default: return <Utensils size={20} />;
  }
};

const CategoryBtn = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-2 transition-all ${active ? 'text-red-500 scale-110' : 'text-neutral-600'}`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? 'bg-red-600/10 border border-red-600/20' : 'bg-neutral-900 border border-neutral-800'}`}>
      {icon}
    </div>
    <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

const DumbbellIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 6.5h11M6.5 17.5h11M12 6.5v11M2 9v6M22 9v6" />
  </svg>
);
