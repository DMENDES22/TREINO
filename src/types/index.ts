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

export type NutritionalGoal = 'Manutenção' | 'Cutting' | 'Bulking Limpo';
export type DietStrategy = 'Dieta Constante' | 'Ciclo de Carboidratos';
export type MealCategory = 'Café da Manhã' | 'Almoço' | 'Lanche' | 'Janta' | 'Ceia';
export type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;

export interface DailyMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  userId: string;
  date: number;
  name: string;
  category: MealCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  weight?: number;
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
  gender: 'Masculino' | 'Feminino' | string;
  goal: 'Hipertrofia' | 'Emagrecimento' | 'Força' | 'Resistência';
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  displayName: string;
  email: string;
  // Nutrition fields
  targetWeight?: number;
  activityLevel?: ActivityLevel;
  nutritionalGoal?: NutritionalGoal;
  dietStrategy?: DietStrategy;
  baseMacros?: DailyMacros;
  carbCycleConfig?: Record<string, 'Low' | 'Medium' | 'High'>;
  // New Measurements
  arm?: number;
  waist?: number;
  chest?: number;
  leg?: number;
  hip?: number;
  neck?: number;
  fatPercentage?: number;
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
