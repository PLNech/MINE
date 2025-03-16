import { GameState, TownScale, GameSpeed, TutorialStage } from '../types/game';
import { v4 as uuidv4 } from 'uuid';

export const INITIAL_STATE: GameState = {
  version: '0.1.0',
  startDate: Date.now(),
  currentWeek: 1,
  treasury: 1000, // Starting capital
  salary: 20, // Default starting salary
  workers: [], // Start with no workers
  buildings: [
    // Start with just the mine
    {
      id: uuidv4(),
      type: 'Mine',
      level: 1,
      condition: 100,
      workers: [], // No workers assigned yet
      position: { x: 0, y: 0, rotation: 0 } // Center of the map
    }
  ],
  economy: {
    treasury: 1000, // Same as main treasury
    weeklyRevenue: 0,
    weeklyExpenses: 0,
    mineralPrice: 20, // Starting price per unit
    priceFluctuation: 0.1 // 10% potential fluctuation
  },
  townScale: TownScale.CAMP, // Start as a camp
  weeklyHistory: [], // No history yet
  tutorial: {
    stage: TutorialStage.INTRODUCTION,
    completed: false,
    conditions: {
      hasAdjustedSalary: false,
      hasViewedWorkers: false,
      hasAdvancedWeek: false
    }
  },
  notifications: [
    {
      id: uuidv4(),
      message: "Welcome to your new mining operation! Let's get started by setting a competitive wage to attract workers.",
      type: 'Info',
      read: false,
      week: 1
    }
  ],
  gameSpeed: GameSpeed.PAUSED, // Start paused
  secretary: {
    currentMessage: "Greetings, sir! I'm delighted to inform you that the deed to the mine and surrounding lands has been officially transferred to your name. The workers are awaiting your direction - shall we begin by setting an appropriate wage to attract suitable labor?",
    messageHistory: []
  },
  gameDate: {
    year: 1890,
    month: 1,
    day: 1,
    dayOfWeek: 2  // Tuesday
  }
};

export const TUTORIAL_FLOW = {
  INTRO_LETTER: {
    next: 'INTRO_1',
    text: "Greetings, sir! I'm delighted to inform you that the deed to the mine and surrounding lands has been officially transferred to your name. The workers are awaiting your direction - shall we begin by setting an appropriate wage to attract suitable labor?",
    isLetter: true
  },
  INTRO_1: {
    next: 'INTRO_2',
    text: "Welcome to your new enterprise! Let's get you acquainted with your responsibilities.",
    stage: TutorialStage.INTRODUCTION,
    step: 1,
    totalSteps: 3
  },
  INTRO_2: {
    next: 'INTRO_3',
    text: "As the owner of this mine, you'll need to manage workers, set wages, and maximize profits.",
    stage: TutorialStage.INTRODUCTION,
    step: 2,
    totalSteps: 3
  },
  INTRO_3: {
    next: 'SALARY_1',
    text: "First, let's look at the salary controls. You'll need to set competitive wages to attract workers.",
    stage: TutorialStage.INTRODUCTION,
    step: 3,
    totalSteps: 3
  },
  SALARY_1: {
    next: 'SALARY_2',
    text: "This is your salary control. Drag the slider to set worker wages.",
    stage: TutorialStage.SALARY_SETTING,
    step: 1,
    totalSteps: 3,
    condition: 'hasAdjustedSalary'
  },
  SALARY_2: {
    next: 'SALARY_3',
    text: "Higher wages attract more workers, but cut into profits. Lower wages save money but may drive workers away.",
    stage: TutorialStage.SALARY_SETTING,
    step: 2,
    totalSteps: 3
  },
  SALARY_3: {
    next: 'WORKER_INTRO_1',
    text: "Now advance the week to see who your salary attracts!",
    stage: TutorialStage.SALARY_SETTING,
    step: 3,
    totalSteps: 3,
    condition: 'hasAdvancedWeek'
  },
  WORKER_INTRO_1: {
    next: 'WORKER_INTRO_2',
    text: "Your first workers have arrived! Let's meet them.",
    stage: TutorialStage.WORKER_MANAGEMENT,
    step: 1,
    totalSteps: 5,
    isWorkerIntro: true
  },
  WORKER_INTRO_2: {
    next: 'WORKER_MANAGEMENT_1',
    text: "These are your first workers. They'll be working in The Mine.",
    stage: TutorialStage.WORKER_MANAGEMENT,
    step: 2,
    totalSteps: 5
  },
  WORKER_MANAGEMENT_1: {
    next: 'WORKER_MANAGEMENT_2',
    text: "These are your first workers. They'll be working in The Mine.",
    stage: TutorialStage.WORKER_MANAGEMENT,
    step: 1,
    totalSteps: 3
  },
  WORKER_MANAGEMENT_2: {
    next: 'WORKER_3',
    text: "Workers in mines produce minerals which generate revenue.",
    stage: TutorialStage.WORKER_MANAGEMENT,
    step: 2,
    totalSteps: 3
  },
  WORKER_3: {
    next: 'COMPLETE',
    text: "Monitor worker satisfaction to maintain productivity.",
    stage: TutorialStage.WORKER_MANAGEMENT,
    step: 3,
    totalSteps: 3
  }
} as const;

export const GAME_PARAMETERS = {
  STARTING_TREASURY: 1000,
  BASE_MINERAL_PRICE: 50,
  MIN_WAGE: 10,
  MAX_WAGE: 100,
  MIGRATION_FACTOR: 50,
  WORKER_SATISFACTION_THRESHOLD: 50
}; 