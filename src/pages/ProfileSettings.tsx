import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Save, User, Scale, MoveVertical, Target, Signal, ArrowRight, Dumbbell } from 'lucide-react';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firebase';

export default function ProfileSettings({ isInitialSetup = false }: { isInitialSetup?: boolean }) {
  const { user, profile, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>(profile || {
    weight: 0,
    height: 0,
    age: 0,
    gender: 'Masculino',
    goal: 'Hipertrofia',
    level: 'Iniciante',
    displayName: user?.displayName || '',
    email: user?.email || '',
    uid: user?.uid || '',
    arm: 0,
    waist: 0,
    neck: 0,
    chest: 0,
    leg: 0,
    hip: 0,
    fatPercentage: 0
  });

  const [step, setStep] = useState(1);

  const calculateIMC = () => {
    if (!formData.weight || !formData.height) return 0;
    const heightInMeters = formData.height / 100;
    return (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getIMCCategory = (imc: number) => {
    if (imc < 18.5) return 'Abaixo do peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidade';
  };

  const calculateBF = () => {
    const { gender, waist, neck, height, hip } = formData;
    if (!waist || !neck || !height) return;

    let bf = 0;
    if (gender === 'Masculino') {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      if (!hip) return;
      bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    }
    
    if (bf > 0) {
      setFormData({ ...formData, fatPercentage: Number(bf.toFixed(1)) });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Save to history if important metrics changed
    const newHistory = [...(profile?.measurementsHistory || [])];
    
    // Check if we already have a record for today to avoid duplicates
    const today = new Date().setHours(0, 0, 0, 0);
    const existingIndex = newHistory.findIndex(h => new Date(h.date).setHours(0,0,0,0) === today);
    
    const measurement = {
      date: Date.now(),
      weight: formData.weight || 0,
      arm: formData.arm,
      waist: formData.waist,
      neck: formData.neck,
      chest: formData.chest,
      leg: formData.leg,
      hip: formData.hip,
      fatPercentage: formData.fatPercentage
    };

    if (existingIndex >= 0) {
      newHistory[existingIndex] = measurement;
    } else {
      newHistory.push(measurement);
    }

    try {
      await updateProfile({ ...formData, measurementsHistory: newHistory });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user?.uid}`);
    }
  };

  const handleNext = () => setStep(step + 1);

  if (isInitialSetup) {
    return (
      <div className="h-screen bg-black flex flex-col p-8 overflow-hidden relative">
         <div className="z-10 flex flex-col h-full">
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

            <div className="flex-1 overflow-y-auto pr-1">
               {step === 1 && (
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                     <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center border border-neutral-800">
                           <User className="text-red-500" size={20} />
                        </div>
                        <h2 className="text-xl font-bold uppercase tracking-tight text-white">O Básico</h2>
                     </div>
                     <div className="space-y-4">
                        <Input label="Qual seu nome?" value={formData.displayName} onChange={(v: string) => setFormData({...formData, displayName: v})} placeholder="Ex: João Silva" />
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
                        <h2 className="text-xl font-bold uppercase tracking-tight text-white">Sua Bio</h2>
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
                        <Select label="Objetivo" value={formData.goal} options={['Hipertrofia', 'Emagrecimento', 'Força', 'Resistência']} onChange={(v: any) => setFormData({...formData, goal: v})} />
                        <Select label="Nível" value={formData.level} options={['Iniciante', 'Intermediário', 'Avançado']} onChange={(v: any) => setFormData({...formData, level: v})} />
                     </div>
                  </motion.div>
               )}
            </div>

            <footer className="py-8">
               {step < 3 ? (
                  <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2">
                     CONTINUAR <ArrowRight size={20} />
                  </button>
               ) : (
                  <button onClick={() => handleSubmit()} className="btn-primary w-full">
                     CONCLUIR SETUP
                  </button>
               )}
            </footer>
         </div>
      </div>
    );
  }

  const imc = Number(calculateIMC());

  return (
    <div className="space-y-6 py-4 pb-20">
       <section className="flex flex-col items-center">
          <div className="w-24 h-24 bg-neutral-900 border-2 border-red-600 p-1 rounded-full mb-4">
             <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden">
                {user?.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <User size={40} className="text-neutral-500" />}
             </div>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight italic text-white">{profile?.displayName}</h2>
          <p className="text-neutral-500 font-bold text-xs uppercase tracking-widest">{profile?.goal} • {profile?.level}</p>
       </section>

       {isEditing ? (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h3 className="text-lg font-black uppercase text-red-500 italic">Editar Informações</h3>
            <div className="grid grid-cols-2 gap-4">
               <Input label="Peso (kg)" value={formData.weight} type="number" onChange={(v: string) => setFormData({...formData, weight: Number(v)})} />
               <Input label="Altura (cm)" value={formData.height} type="number" onChange={(v: string) => setFormData({...formData, height: Number(v)})} />
               <Input label="Braço (cm)" value={formData.arm} type="number" onChange={(v: string) => setFormData({...formData, arm: Number(v)})} />
               <Input label="Cintura (cm)" value={formData.waist} type="number" onChange={(v: string) => setFormData({...formData, waist: Number(v)})} />
               <Input label="Pescoço (cm)" value={formData.neck} type="number" onChange={(v: string) => setFormData({...formData, neck: Number(v)})} />
               <Input label="Peito (cm)" value={formData.chest} type="number" onChange={(v: string) => setFormData({...formData, chest: Number(v)})} />
               <Input label="Perna (cm)" value={formData.leg} type="number" onChange={(v: string) => setFormData({...formData, leg: Number(v)})} />
               <Input label="Quadril (cm)" value={formData.hip} type="number" onChange={(v: string) => setFormData({...formData, hip: Number(v)})} />
               <Input label="BF (%)" value={formData.fatPercentage} type="number" onChange={(v: string) => setFormData({...formData, fatPercentage: Number(v)})} />
               <button 
                  onClick={calculateBF}
                  className="col-span-2 py-3 bg-red-600/10 border border-red-600/30 rounded-xl text-red-500 font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                >
                  Autocalcular BF (Método Marinha)
                </button>
            </div>
            <div className="flex gap-4">
               <button onClick={() => setIsEditing(false)} className="flex-1 bg-neutral-800 py-4 rounded-2xl font-bold uppercase text-xs">Cancelar</button>
               <button onClick={() => handleSubmit()} className="flex-1 bg-red-600 py-4 rounded-2xl font-bold uppercase text-xs">Salvar Alterações</button>
            </div>
         </motion.div>
       ) : (
         <>
            {/* IMC Display */}
            <div className="bg-red-600/10 border border-red-600/30 rounded-3xl p-6 flex items-center justify-between">
               <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1 block">Seu IMC Atual</span>
                  <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-black italic text-white">{imc}</span>
                     <span className="text-xs font-bold text-red-500 uppercase">{getIMCCategory(imc)}</span>
                  </div>
               </div>
               <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
                  <Signal className="text-white" size={24} />
               </div>
            </div>

            <section className="space-y-4">
               <div className="flex justify-between items-center px-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500">Medidas Corporais</h3>
                  <button onClick={() => setIsEditing(true)} className="text-red-500 text-[10px] font-black uppercase">Editar Medidas</button>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <MetricsDisplay icon={<Scale size={14} />} label="Peso" value={`${profile?.weight}kg`} />
                  <MetricsDisplay icon={<MoveVertical size={14} />} label="Altura" value={`${profile?.height}cm`} />
                  <MetricsDisplay icon={<Dumbbell size={14} />} label="Braço" value={`${profile?.arm || '--'}cm`} />
                  <MetricsDisplay icon={<Target size={14} />} label="Cintura" value={`${profile?.waist || '--'}cm`} />
                  <MetricsDisplay icon={<Target size={14} />} label="Pescoço" value={`${profile?.neck || '--'}cm`} />
                  <MetricsDisplay icon={<Signal size={14} />} label="Gordura" value={`${profile?.fatPercentage || '--'}%`} />
                  <MetricsDisplay icon={<Target size={14} />} label="Peito" value={`${profile?.chest || '--'}cm`} />
                  <MetricsDisplay icon={<Target size={14} />} label="Quadril" value={`${profile?.hip || '--'}cm`} />
               </div>
            </section>

            {/* Evolution/History */}
            {profile?.measurementsHistory && profile.measurementsHistory.length > 0 && (
               <section className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 px-2">Histórico de Peso</h3>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
                     <div className="flex items-end justify-between h-24 gap-1">
                        {profile.measurementsHistory.slice(-10).map((h, i) => (
                           <div key={i} className="flex-1 flex flex-col items-center">
                              <div 
                                 className="w-full bg-red-600 rounded-t-sm" 
                                 style={{ height: `${(h.weight / 150) * 100}%` }} 
                              />
                               <span className="text-[8px] font-bold text-neutral-600 mt-1">{new Date(h.date).getDate()}/{new Date(h.date).getMonth()+1}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>
            )}

            <section className="space-y-4">
               <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 px-2">Conta</h3>
               <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                  <button onClick={logout} className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 text-red-500">
                     <span className="font-bold text-sm">Sair da Conta</span>
                     <ArrowRight size={16} />
                  </button>
               </div>
            </section>
         </>
       )}
    </div>
  );
}

const Input = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-black uppercase tracking-widest text-neutral-500 px-1">{label}</label>
    <input 
      type={type}
      value={(value === 0 || value === undefined || value === null) ? '' : value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-6 py-4 font-bold text-white focus:border-red-600 focus:outline-none transition-colors"
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

const MetricsDisplay = ({ icon, label, value }: any) => (
   <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-3 flex flex-col items-center justify-center">
      <div className="text-red-500 mb-1">{icon}</div>
      <span className="text-[10px] uppercase font-black text-neutral-500 tracking-tighter">{label}</span>
      <span className="font-black text-sm text-white">{value}</span>
   </div>
);
