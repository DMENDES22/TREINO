import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { Save, User, Scale, MoveVertical, Target, Signal, ArrowRight, Dumbbell, History, TrendingUp, Info, LogOut, ChevronRight, X } from 'lucide-react';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Input = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">{label}</label>
    <input 
      type={type}
      value={(value === 0 || value === undefined || value === null) ? '' : value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 font-bold text-white focus:border-red-600 focus:outline-none transition-colors text-sm"
    />
  </div>
);

const Select = ({ label, value, options, onChange }: any) => (
   <div className="space-y-2">
     <label className="text-xs font-black uppercase tracking-widest text-neutral-500 px-1">{label}</label>
     <div className="grid grid-cols-1 gap-2">
        {options.map((opt: string) => (
           <button 
              key={opt}
              onClick={() => onChange(opt)}
              className={`w-full text-left px-6 py-4 rounded-2xl font-bold border transition-all ${value === opt ? 'bg-red-600/10 border-red-600 text-red-500 shadow-lg shadow-red-600/10' : 'bg-neutral-900 border-neutral-800 text-white'}`}
           >
              {opt}
           </button>
        ))}
     </div>
   </div>
);

const MeasureCard = ({ icon, label, value }: any) => (
   <div className="bg-neutral-900 border border-neutral-800/50 rounded-2xl p-3 flex items-center justify-between group hover:border-red-600/30 transition-all">
      <div className="flex items-center gap-2">
         <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-neutral-600 group-hover:text-red-500 transition-colors">
            {icon}
         </div>
         <span className="text-[10px] font-black uppercase text-neutral-500 tracking-tighter">{label}</span>
      </div>
      <span className="font-black text-xs text-white">{value}</span>
   </div>
);

export default function ProfileSettings({ isInitialSetup = false }: { isInitialSetup?: boolean }) {
  const { user, profile, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>(profile || {
    weight: 0,
    height: 0,
    age: 0,
    gender: 'Masculino',
    goal: 'Ganhar massa',
    level: 'Iniciante',
    displayName: user?.displayName || '',
    name: profile?.name || user?.displayName || '',
    email: user?.email || '',
    uid: user?.uid || '',
    arm: 0,
    waist: 0,
    neck: 0,
    chest: 0,
    leg: 0,
    hip: 0,
    biceps: 0,
    fatPercentage: 0,
    leanMass: 0
  });

  const [step, setStep] = useState(1);

  const stats = useMemo(() => {
    const w = formData.weight || 0;
    const h = formData.height || 0;
    const waist = formData.waist || 0;
    const neck = formData.neck || 0;
    const hip = formData.hip || 0;
    const gender = formData.gender;

    // IMC
    const heightInMeters = h / 100;
    const imc = h > 0 ? (w / (heightInMeters * heightInMeters)).toFixed(1) : '0';

    // BF% (Navy Method)
    let bf = 0;
    if (waist > 0 && neck > 0 && h > 0) {
      if (gender === 'Masculino') {
        const val = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) - 450;
        bf = val > 0 ? val : 0;
      } else if (hip > 0) {
        const val = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(h)) - 450;
        bf = val > 0 ? val : 0;
      }
    }

    const leanMass = w * (1 - bf / 100);

    return {
      imc: Number(imc),
      bf: Number(bf.toFixed(1)),
      leanMass: Number(leanMass.toFixed(1))
    };
  }, [formData]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const measurement = {
      date: Date.now(),
      weight: formData.weight || 0,
      arm: formData.arm,
      waist: formData.waist,
      neck: formData.neck,
      chest: formData.chest,
      leg: formData.leg,
      hip: formData.hip,
      biceps: formData.biceps,
      fatPercentage: stats.bf
    };

    const newHistory = [...(profile?.measurementsHistory || [])];
    const today = new Date().setHours(0, 0, 0, 0);
    const existingIndex = newHistory.findIndex(h => new Date(h.date).setHours(0,0,0,0) === today);

    if (existingIndex >= 0) {
      newHistory[existingIndex] = measurement;
    } else {
      newHistory.push(measurement);
    }

    try {
      await updateProfile({ 
        ...formData, 
        fatPercentage: stats.bf, 
        leanMass: stats.leanMass,
        measurementsHistory: newHistory 
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user?.uid}`);
    }
  };

  const chartData = useMemo(() => {
    if (!profile?.measurementsHistory) return [];
    return profile.measurementsHistory.map(h => ({
      name: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      peso: h.weight,
      bf: h.fatPercentage || 0,
      cintura: h.waist || 0
    })).slice(-15);
  }, [profile?.measurementsHistory]);

  if (isInitialSetup) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col p-8 overflow-hidden">
         <div className="z-10 flex flex-col h-full max-w-md mx-auto w-full">
            <header className="mb-12">
               <div className="w-12 h-1.5 bg-neutral-800 rounded-full mb-8 overflow-hidden">
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(step/3)*100}%` }}
                     className="h-full bg-red-600" 
                  />
               </div>
               <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">QUASE LÁ</h1>
               <p className="text-neutral-500 font-medium tracking-tight">Personalize sua experiência para melhores resultados.</p>
            </header>

            <div className="flex-1 overflow-y-auto pr-1 custom-scroll">
               {step === 1 && (
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                     <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center border border-neutral-800">
                           <User className="text-red-500" size={20} />
                        </div>
                        <h2 className="text-xl font-bold uppercase tracking-tight text-white">Dados Pessoais</h2>
                     </div>
                     <div className="space-y-4">
                        <Input label="Qual seu nome?" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v, displayName: v})} placeholder="Ex: João Silva" />
                        <Select label="Sexo" value={formData.gender} options={['Masculino', 'Feminino']} onChange={(v: any) => setFormData({...formData, gender: v})} />
                        <Input label="Sua idade" value={formData.age} type="number" onChange={(v: string) => setFormData({...formData, age: Number(v)})} placeholder="Ex: 25" />
                     </div>
                  </motion.div>
               )}

               {step === 2 && (
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                     <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center border border-neutral-800">
                           <Scale className="text-red-500" size={20} />
                        </div>
                        <h2 className="text-xl font-bold uppercase tracking-tight text-white">Bio</h2>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <Input label="Peso (kg)" value={formData.weight} type="number" onChange={(v: string) => setFormData({...formData, weight: Number(v)})} placeholder="80" />
                        <Input label="Altura (cm)" value={formData.height} type="number" onChange={(v: string) => setFormData({...formData, height: Number(v)})} placeholder="180" />
                     </div>
                  </motion.div>
               )}

               {step === 3 && (
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                     <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center border border-neutral-800">
                           <Target className="text-red-500" size={20} />
                        </div>
                        <h2 className="text-xl font-bold uppercase tracking-tight text-white">Objetivos</h2>
                     </div>
                     <div className="space-y-4">
                        <Select label="Objetivo" value={formData.goal} options={['Emagrecer', 'Ganhar massa', 'Manter peso']} onChange={(v: any) => setFormData({...formData, goal: v})} />
                        <Select label="Nível" value={formData.level} options={['Iniciante', 'Intermediário', 'Avançado']} onChange={(v: any) => setFormData({...formData, level: v})} />
                     </div>
                  </motion.div>
               )}
            </div>

            <footer className="py-8">
               {step < 3 ? (
                  <button onClick={() => setStep(step + 1)} className="w-full bg-red-600 py-4 rounded-2xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 text-white">
                     CONTINUAR <ArrowRight size={20} />
                  </button>
               ) : (
                  <button onClick={() => handleSubmit()} className="w-full bg-red-600 py-4 rounded-2xl font-black text-xs tracking-widest uppercase text-white shadow-xl shadow-red-600/30">
                     CONCLUIR SETUP
                  </button>
               )}
            </footer>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-10">
       {/* Hero Section */}
       <div className="relative pt-8 pb-12 mb-8 bg-neutral-950 rounded-b-[40px] border-b border-neutral-900 px-6">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-neutral-900 border-2 border-red-600 p-1 rounded-3xl rotate-3 transform transition-transform hover:rotate-0">
                   <div className="w-full h-full bg-neutral-800 rounded-2xl flex items-center justify-center overflow-hidden">
                      {user?.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <User size={30} className="text-neutral-500" />}
                   </div>
                </div>
                <div>
                   <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">{profile?.name || profile?.displayName}</h2>
                   <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1 opacity-80">{profile?.goal} • {profile?.age} ANOS</p>
                </div>
             </div>
             <button 
               onClick={() => setIsEditing(true)}
               className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
             >
                <TrendingUp size={20} />
             </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
             <div className="bg-black/40 p-4 rounded-3xl border border-neutral-800/50">
                <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-1">Peso Atual</p>
                <div className="flex items-baseline gap-1">
                   <span className="text-lg font-black text-white italic">{profile?.weight}</span>
                   <span className="text-[8px] font-bold text-neutral-600 uppercase">KG</span>
                </div>
             </div>
             <div className="bg-black/40 p-4 rounded-3xl border border-neutral-800/50">
                <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-1">Fat Est. (BF)</p>
                <div className="flex items-baseline gap-1">
                   <span className="text-lg font-black text-red-500 italic">{profile?.fatPercentage || '--'}</span>
                   <span className="text-[8px] font-bold text-neutral-600 uppercase">%</span>
                </div>
             </div>
             <div className="bg-black/40 p-4 rounded-3xl border border-neutral-800/50">
                <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-1">Massa Magra</p>
                <div className="flex items-baseline gap-1">
                   <span className="text-lg font-black text-blue-500 italic">{profile?.leanMass || '--'}</span>
                   <span className="text-[8px] font-bold text-neutral-600 uppercase">KG</span>
                </div>
             </div>
          </div>

          <div className="mt-4 px-2 flex justify-between items-center opacity-50">
             <div className="flex items-center gap-1">
                <span className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">IMC Secundário:</span>
                <span className="text-[10px] font-black text-white italic">{stats.imc}</span>
             </div>
             <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">IronFlow v2.0</span>
          </div>
       </div>

       <div className="px-6 space-y-8">
          {/* Action List */}
          <section className="space-y-4">
             <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 px-2">Ações</h3>
             <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] overflow-hidden">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-between p-6 hover:bg-neutral-800/50 transition-colors"
                >
                   <div className="flex items-center gap-3 text-white">
                      <Scale size={20} className="text-red-500" />
                      <span className="font-black text-xs uppercase tracking-widest leading-none">Atualizar Medidas</span>
                   </div>
                   <ChevronRight size={16} className="text-neutral-600" />
                </button>
             </div>
          </section>

          {/* All Measures */}
          <section className="space-y-4 pb-12">
             <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500">Minhas Medidas</h3>
                <button onClick={() => setIsEditing(true)} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline">Editar</button>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <MeasureCard icon={<Target size={14} />} label="Braço (C)" value={profile?.arm ? `${profile.arm}cm` : '--'} />
                <MeasureCard icon={<Target size={14} />} label="Bíceps (R)" value={profile?.biceps ? `${profile.biceps}cm` : '--'} />
                <MeasureCard icon={<Target size={14} />} label="Cintura" value={profile?.waist ? `${profile.waist}cm` : '--'} />
                <MeasureCard icon={<Target size={14} />} label="Pescoço" value={profile?.neck ? `${profile.neck}cm` : '--'} />
                <MeasureCard icon={<Target size={14} />} label="Peito" value={profile?.chest ? `${profile.chest}cm` : '--'} />
                <MeasureCard icon={<Target size={14} />} label="Quadril" value={profile?.hip ? `${profile.hip}cm` : '--'} />
                <MeasureCard icon={<Target size={14} />} label="Coxa" value={profile?.leg ? `${profile.leg}cm` : '--'} />
                <MeasureCard icon={<User size={14} />} label="Idade" value={`${profile?.age} ANOS`} />
             </div>
          </section>
       </div>

       {/* Edit Overlay */}
       <AnimatePresence>
          {isEditing && (
             <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-neutral-950 border border-neutral-800 w-full max-w-sm rounded-[40px] flex flex-col overflow-hidden shadow-2xl h-[90vh]"
                >
                   <header className="p-6 border-b border-neutral-900 flex justify-between items-center shrink-0">
                      <div>
                         <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Atualizar Shape</h3>
                         <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Medições Reais</p>
                      </div>
                      <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-neutral-900 rounded-full text-white"><X size={20} /></button>
                   </header>

                   <div className="flex-1 overflow-y-scroll p-6 space-y-6 custom-scroll">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="col-span-2">
                           <Input label="Seu Nome" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v, displayName: v})} />
                         </div>
                         <Input label="Idade" value={formData.age} type="number" onChange={(v: string) => setFormData({...formData, age: Number(v)})} />
                         <Input label="Peso (kg)" value={formData.weight} type="number" onChange={(v: string) => setFormData({...formData, weight: Number(v)})} />
                         <Input label="Altura (cm)" value={formData.height} type="number" onChange={(v: string) => setFormData({...formData, height: Number(v)})} />
                         <Input label="Braço Contraído" value={formData.arm} type="number" onChange={(v: string) => setFormData({...formData, arm: Number(v)})} />
                         <Input label="Bíceps Relaxado" value={formData.biceps} type="number" onChange={(v: string) => setFormData({...formData, biceps: Number(v)})} />
                         <Input label="Cintura" value={formData.waist} type="number" onChange={(v: string) => setFormData({...formData, waist: Number(v)})} />
                         <Input label="Pescoço" value={formData.neck} type="number" onChange={(v: string) => setFormData({...formData, neck: Number(v)})} />
                         <Input label="Peito" value={formData.chest} type="number" onChange={(v: string) => setFormData({...formData, chest: Number(v)})} />
                         <Input label="Quadril" value={formData.hip} type="number" onChange={(v: string) => setFormData({...formData, hip: Number(v)})} />
                         <Input label="Perna" value={formData.leg} type="number" onChange={(v: string) => setFormData({...formData, leg: Number(v)})} />
                         <div className="col-span-2 space-y-2 bg-neutral-900 p-4 rounded-3xl border border-neutral-800">
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Resultado do Cálculo:</span>
                               <Info size={14} className="text-neutral-700" />
                            </div>
                            <div className="flex gap-4">
                               <div>
                                  <p className="text-[8px] font-black uppercase text-red-500 leading-none mb-1">BF %</p>
                                  <p className="text-xl font-black text-white italic">{stats.bf}%</p>
                               </div>
                               <div>
                                  <p className="text-[8px] font-black uppercase text-blue-500 leading-none mb-1">Lean Mass</p>
                                  <p className="text-xl font-black text-white italic">{stats.leanMass}kg</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="p-6 bg-neutral-950 border-t border-neutral-900 shrink-0">
                      <button 
                        onClick={() => handleSubmit()}
                        className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl shadow-white/5"
                      >
                         Salvar Novas Medidas
                      </button>
                   </div>
                </motion.div>
             </div>
          )}
       </AnimatePresence>
    </div>
  );
}
