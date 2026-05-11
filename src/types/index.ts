export type MuscleGroup = 
  | 'Peito' 
  | 'Costas' 
  | 'Ombros' 
  | 'Bíceps' 
  | 'Tríceps' 
  | 'Pernas' 
  | 'Glúteos' 
  | 'Abdômen' 
  | 'Panturrilha' 
  | 'Antebraço';

export interface Exercise {
  id: string;
  name: string;
  category: MuscleGroup;
  description: string;
  instructions: string[];
  muscles: string[];
  equipment: string;
  gifUrl: string;
}

export interface Set {
  reps: number;
  weight: number;
  completed: boolean;
  type: 'A' | 'P' | 'V'; // A: Aquecimento, P: Preparatória, V: Válida
  rpe?: number;
}

export interface WorkoutExercise extends Exercise {
  sets: Set[];
  restTime: number; // in seconds
  notes?: string;
}

export interface Workout {
  id: string;
  userId: string;
  title: string;
  description?: string;
  exercises: WorkoutExercise[];
  createdAt: number;
}

export interface Session {
  id: string;
  userId: string;
  workoutId: string;
  title: string;
  date: number;
  exercises: WorkoutExercise[];
  duration: number; // minutes
  totalVolume: number;
}

export interface UserProfile {
  uid: string;
  weight: number;
  height: number;
  age: number;
  goal: 'Emagrecer' | 'Ganhar massa' | 'Manter peso' | 'Hipertrofia' | 'Força' | 'Resistência';
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  displayName: string;
  name?: string;
  email: string;
  gender: string; // Masculino | Feminino
  // New Measurements
  arm?: number;
  waist?: number;
  chest?: number;
  leg?: number;
  hip?: number;
  neck?: number;
  biceps?: number;
  fatPercentage?: number;
  leanMass?: number;
  measurementsHistory?: {
    date: number;
    weight: number;
    arm?: number;
    waist?: number;
    chest?: number;
    leg?: number;
    hip?: number;
    fatPercentage?: number;
  }[];
}
