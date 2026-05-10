import { UserProfile, DailyMacros, ActivityLevel, NutritionalGoal } from '../types';

export const calculateBMR = (profile: UserProfile): number => {
  const { weight, height, age, gender } = profile;
  if (gender === 'Masculino') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

export const getGoalMultiplier = (goal: NutritionalGoal): number => {
  switch (goal) {
    case 'Manutenção': return 1.6;
    case 'Cutting': return 1.4;
    case 'Bulking Limpo': return 1.72;
    default: return 1.6;
  }
};

export const calculateMacros = (profile: UserProfile): DailyMacros => {
  const bmr = calculateBMR(profile);
  const goalMultiplier = getGoalMultiplier(profile.nutritionalGoal || 'Manutenção');
  const targetCalories = bmr * goalMultiplier;

  const protein = profile.weight * 2.0;
  let fat = profile.weight * 0.8;
  if (fat < 60) fat = 60;

  const proteinCal = protein * 4;
  const fatCal = fat * 9;
  
  let carbs = (targetCalories - proteinCal - fatCal) / 4;
  if (carbs > 350) carbs = 350;
  if (carbs < 0) carbs = 0;

  // Re-calculate total calories based on actual macros (since we capped carbs)
  const actualCalories = (protein * 4) + (fat * 9) + (carbs * 4);

  return {
    calories: Math.round(actualCalories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat)
  };
};

export const calculateCycleMacros = (baseMacros: DailyMacros, intensity: 'Low' | 'Medium' | 'High'): DailyMacros => {
  const { protein, fat, carbs } = baseMacros;
  let newCarbs = carbs;

  if (intensity === 'High') {
    newCarbs = carbs * 1.3;
  } else if (intensity === 'Low') {
    newCarbs = carbs * 0.7;
  }

  const calories = (protein * 4) + (fat * 9) + (newCarbs * 4);

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(newCarbs),
    fat: Math.round(fat)
  };
};
