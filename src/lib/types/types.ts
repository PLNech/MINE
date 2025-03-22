export enum GameSpeed {
  PAUSED = 0,
  NORMAL = 1,
  FAST = 3
}

export enum TownScale {
  CAMP = 'Camp',          // 5-20 workers
  SETTLEMENT = 'Settlement', // 21-50 workers
  VILLAGE = 'Village',    // 51-100 workers
  TOWN = 'Town',          // 101-250 workers
  CITY = 'City'           // 251-500 workers
}

export enum BuildingType {
  MINE = 'Mine',
  BARRACKS = 'Barracks',
  HOUSE = 'House',
  INFIRMARY = 'Infirmary',
  CANTEEN = 'Canteen',
  SCHOOL = 'School',
  STORE = 'Store'
}

export enum EffectType {
  HEALTH = 'Health',
  SATISFACTION = 'Satisfaction',
  PRODUCTIVITY = 'Productivity',
  HOUSING = 'Housing'
}

export interface BuildingEffect {
  type: EffectType;
  value: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  name: string;
  constructionProgress: number; // 0-100
  constructionCost: number;
  isOperational: boolean;
  maintenanceCost: number;
  workerCapacity: number;
  assignedWorkers: number;
  effects: BuildingEffect[];
  description: string;
  unlockRequirement?: {
    townScale: TownScale;
    treasury?: number;
  };
}

export interface FinancialRecord {
  week: number;
  revenue: number;
  expenses: number;
  profit: number;
  treasury: number;
  workerCount: number;
  workerSatisfaction: number;
  workerHealth: number;
  mineralPrice: number;
  production: number;
}

export interface GameState {
  // Time & Progression
  currentWeek: number;
  currentDay: number;
  gameSpeed: GameSpeed;
  townScale: TownScale;
  
  // Economy
  treasury: number;
  weeklyRevenue: number;
  weeklyExpenses: number;
  salary: number;
  buildingMaintenance: number;
  debt: number;
  financialHistory: FinancialRecord[];
  
  // Production
  mineProductionRate: number;
  totalMineralExtraction: number;
  currentMineralPrice: number;
  baseProductionPerWorker: number;
  
  // Workers
  workerCount: number;
  maxWorkerCapacity: number;
  workerSatisfaction: number;
  workerHealth: number;
  weeklyMigration: {
    arrivals: number;
    departures: number;
  };
  workerAssignments: {
    [buildingId: string]: number;
  };
  
  // Buildings
  buildings: Building[];
  
  // Game status
  isGameOver: boolean;
  isPaused: boolean;
  isCeremonyActive: boolean;
  
  // First-time experience
  hasSeenIntro: boolean;
} 