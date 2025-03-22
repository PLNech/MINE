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

export interface BuildingUnlockRequirement {
  townScale: TownScale;
  treasury?: number;
}

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  description: string;
  constructionCost: number;
  maintenanceCost: number;
  effects: BuildingEffect[];
  workerCapacity: number;  // Will be 0 for buildings like barracks that don't need workers
  assignedWorkers: number;
  isOperational: boolean;
  constructionProgress: number;
  maxCount?: number;  // Maximum number of this building type allowed
  currentCount?: number; // Current count of this building type
  unlockRequirement?: BuildingUnlockRequirement;
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

export enum UpgradeType {
  MINE_CAPACITY = 'Mine Capacity',
  MARKET_STABILITY = 'Market Stability',
  HOUSING_EFFICIENCY = 'Housing Efficiency'
}

export interface Upgrade {
  id: string;
  type: UpgradeType;
  name: string;
  description: string;
  maxLevel: number;
  currentLevel: number;
  baseCost: number;
  costMultiplier: number; // How much the cost increases per level
  effect: {
    type: EffectType | 'priceStability' | 'mineCapacity' | 'housingEfficiency';
    valuePerLevel: number;
  };
}

export interface DailyTransaction {
  day: number;
  week: number;
  mineralExtraction: number;
  revenue: number;
  expenses: {
    maintenance: number;
    salaries?: number; // Only on the last day of the week
    upgrades?: number; // Only when upgrades are purchased
    construction?: number; // Only when construction happens
  };
  mineralPrice: number;
  netChange: number;
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
  
  // Upgrades
  upgrades: Upgrade[];
  
  // Daily economic tracking
  dailyTransactions: DailyTransaction[];
  todayExtraction: number;
  todayRevenue: number;
  todayExpenses: number;
} 