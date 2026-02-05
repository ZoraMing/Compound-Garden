export type Language = 'zh' | 'en';

export interface SimulationParams {
  principal: number;
  monthlyContribution: number;
  monthlyExpenses: number; // New: For FIRE calculation
  interestRate: number; // Percentage, e.g., 5 for 5%
  duration: number;
  durationUnit: 'years' | 'months';
}

export interface DataPoint {
  timeIndex: number;
  label: string;
  totalPrincipal: number;
  totalInterest: number;
  balance: number;
}

export enum GameStage {
  CHAPTER_1 = 0,
  CHAPTER_2 = 1,
  CHAPTER_3 = 2,
  CHAPTER_4 = 3, // Passive Income
  CHAPTER_5 = 4, // FIRE
  SANDBOX = 5,
}

export interface ChapterConfig {
  id: GameStage;
  title: string;
  subtitle: string;
  description: string;
  defaultParams: SimulationParams;
  lockedParams: (keyof SimulationParams)[]; // Which controls are hidden/locked
  nextCondition: (params: SimulationParams, data?: DataPoint[]) => boolean; 
  nextButtonText: string;
}
