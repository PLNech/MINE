import { Building, BuildingType, EffectType, FinancialRecord, GameSpeed, GameState, TownScale } from '../types/types';
import { INITIAL_BUILDINGS } from '../constants/buildings';

export const INITIAL_GAME_STATE: GameState = {
  // Time & Progression
  currentWeek: 1,
  currentDay: 1,
  gameSpeed: GameSpeed.PAUSED,
  townScale: TownScale.CAMP,
  
  // Economy
  treasury: 10000, // Start with 10,000 currency units
  weeklyRevenue: 0,
  weeklyExpenses: 0,
  salary: 50, // Default mid-range salary
  buildingMaintenance: 0,
  debt: 0,
  financialHistory: [],
  
  // Production
  mineProductionRate: 0,
  totalMineralExtraction: 0,
  currentMineralPrice: 50, // Base price per ton as specified in PRD
  baseProductionPerWorker: 1.0, // Base production rate per worker
  
  // Workers
  workerCount: 0,
  maxWorkerCapacity: 0,
  workerSatisfaction: 100, // Start with full satisfaction
  workerHealth: 100, // Start with full health
  weeklyMigration: {
    arrivals: 0,
    departures: 0,
  },
  workerAssignments: {},
  
  // Buildings
  buildings: INITIAL_BUILDINGS,
  
  // Game status
  isGameOver: false,
  isPaused: true,
  isCeremonyActive: false,
  
  // First-time experience
  hasSeenIntro: false,
};

export const calculateTownScale = (workerCount: number): TownScale => {
  if (workerCount < 5) return TownScale.CAMP;
  if (workerCount <= 20) return TownScale.CAMP;
  if (workerCount <= 50) return TownScale.SETTLEMENT;
  if (workerCount <= 100) return TownScale.VILLAGE;
  if (workerCount <= 250) return TownScale.TOWN;
  return TownScale.CITY;
};

export const calculateMaxWorkerCapacity = (buildings: Building[]): number => {
  return buildings.reduce((capacity, building) => {
    if (building.isOperational) {
      const housingEffect = building.effects.find(effect => effect.type === EffectType.HOUSING);
      if (housingEffect) {
        return capacity + housingEffect.value;
      }
    }
    return capacity;
  }, 0);
};

export const calculateMaintenance = (buildings: Building[]): number => {
  return buildings.reduce((total, building) => {
    if (building.isOperational) {
      return total + building.maintenanceCost;
    }
    return total;
  }, 0);
};

export const calculateProductivity = (
  health: number,
  satisfaction: number,
  buildings: Building[]
): number => {
  // Base productivity formula as specified in the PRD
  // Productivity = BaseProductivity * (0.5 + (Health * 0.25) + (Satisfaction * 0.25))
  let baseProductivity = 0.5 + (health * 0.25) / 100 + (satisfaction * 0.25) / 100;
  
  // Additional productivity bonuses from buildings
  buildings.forEach(building => {
    if (building.isOperational) {
      const productivityEffect = building.effects.find(
        effect => effect.type === EffectType.PRODUCTIVITY
      );
      if (productivityEffect) {
        baseProductivity += productivityEffect.value / 100;
      }
    }
  });
  
  return baseProductivity;
};

export const calculateWeeklyMigration = (
  salary: number,
  workerSatisfaction: number,
  maxWorkerCapacity: number,
  currentWorkers: number
): { arrivals: number; departures: number } => {
  // Formula from PRD: Migration = (Salary - 10) / (100 - 10) * 50
  const migrationFactor = 50; // Base migration factor
  const minSalary = 10;
  const maxSalary = 100;
  
  // Calculate potential arrivals
  let arrivals = Math.floor((salary - minSalary) / (maxSalary - minSalary) * migrationFactor);
  
  // Limit arrivals based on available housing
  const availableHousing = maxWorkerCapacity - currentWorkers;
  arrivals = Math.min(arrivals, availableHousing);
  arrivals = Math.max(arrivals, 0); // Ensure non-negative
  
  // Calculate departures based on satisfaction
  let departures = 0;
  if (workerSatisfaction < 30) {
    // High departure rate when satisfaction is very low
    departures = Math.ceil(currentWorkers * (0.3 - workerSatisfaction / 100));
  } else if (workerSatisfaction < 50) {
    // Moderate departure rate
    departures = Math.ceil(currentWorkers * 0.05);
  }
  
  return { arrivals, departures };
};

export const calculateMineralPrice = (): number => {
  // Base price with random fluctuation within ±20% as specified in PRD
  const basePrice = 50;
  const fluctuation = 0.2; // 20%
  const randomFactor = 1 + (Math.random() * fluctuation * 2 - fluctuation);
  return Math.round(basePrice * randomFactor);
};

export const calculateWeeklyProduction = (
  mineWorkers: number,
  productivity: number,
  baseProductionRate: number
): number => {
  // Production formula from PRD
  return mineWorkers * productivity * baseProductionRate;
};

export const calculateWeeklyRevenue = (
  production: number,
  mineralPrice: number
): number => {
  return production * mineralPrice;
};

export const calculateWeeklyExpenses = (
  workerCount: number,
  salary: number,
  buildingMaintenance: number
): number => {
  return workerCount * salary + buildingMaintenance;
};

export const processWeeklyCeremony = (state: GameState): GameState => {
  // Calculate max worker capacity
  const maxWorkerCapacity = calculateMaxWorkerCapacity(state.buildings);
  
  // Calculate building maintenance
  const buildingMaintenance = calculateMaintenance(state.buildings);
  
  // Calculate productivity
  const productivity = calculateProductivity(
    state.workerHealth,
    state.workerSatisfaction,
    state.buildings
  );
  
  // Calculate mineral price (fluctuates weekly)
  const mineralPrice = calculateMineralPrice();
  
  // Get mine workers (from the mine building)
  const mine = state.buildings.find(b => b.type === BuildingType.MINE);
  const mineWorkers = mine ? mine.assignedWorkers : 0;
  
  // Calculate production
  const production = calculateWeeklyProduction(
    mineWorkers,
    productivity,
    state.baseProductionPerWorker
  );
  
  // Calculate revenue
  const weeklyRevenue = calculateWeeklyRevenue(production, mineralPrice);
  
  // Calculate expenses
  const weeklyExpenses = calculateWeeklyExpenses(
    state.workerCount,
    state.salary,
    buildingMaintenance
  );
  
  // Calculate profit
  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  
  // Update treasury
  let treasury = state.treasury + weeklyProfit;
  treasury = Math.max(treasury, 0); // Prevent negative treasury
  
  // Calculate migration
  const migration = calculateWeeklyMigration(
    state.salary,
    state.workerSatisfaction,
    maxWorkerCapacity,
    state.workerCount
  );
  
  // Update worker count
  const newWorkerCount = state.workerCount + migration.arrivals - migration.departures;
  
  // Calculate worker health change
  // Health decreases by 5 points per week without health facilities
  let newHealth = state.workerHealth - 5;
  
  // Apply health bonuses from buildings
  state.buildings.forEach(building => {
    if (building.isOperational) {
      const healthEffect = building.effects.find(
        effect => effect.type === EffectType.HEALTH
      );
      if (healthEffect) {
        newHealth += healthEffect.value;
      }
    }
  });
  
  // Clamp health to 0-100 range
  newHealth = Math.max(0, Math.min(100, newHealth));
  
  // Calculate worker satisfaction change
  // Base satisfaction from salary: Satisfaction = (Salary / AverageSalary) * (1 + InfrastructureBonus)
  const averageSalary = 50; // Assuming 50 is the regional average
  let infrastructureBonus = 0;
  
  // Calculate infrastructure bonus from buildings
  state.buildings.forEach(building => {
    if (building.isOperational) {
      const satisfactionEffect = building.effects.find(
        effect => effect.type === EffectType.SATISFACTION
      );
      if (satisfactionEffect) {
        infrastructureBonus += satisfactionEffect.value / 100;
      }
    }
  });
  
  let newSatisfaction = (state.salary / averageSalary) * (1 + infrastructureBonus) * 100;
  
  // Health affects satisfaction
  if (newHealth < 50) {
    newSatisfaction *= 0.8; // 20% penalty when health is low
  }
  
  // Clamp satisfaction to 0-100 range
  newSatisfaction = Math.max(0, Math.min(100, newSatisfaction));
  
  // Calculate town scale
  const townScale = calculateTownScale(newWorkerCount);
  
  // Create financial record
  const financialRecord: FinancialRecord = {
    week: state.currentWeek,
    revenue: weeklyRevenue,
    expenses: weeklyExpenses,
    profit: weeklyProfit,
    treasury,
    workerCount: newWorkerCount,
    workerSatisfaction: newSatisfaction,
    workerHealth: newHealth,
    mineralPrice,
    production
  };
  
  // Update game state
  return {
    ...state,
    currentWeek: state.currentWeek + 1,
    currentDay: 1,
    treasury,
    weeklyRevenue,
    weeklyExpenses,
    totalMineralExtraction: state.totalMineralExtraction + production,
    currentMineralPrice: mineralPrice,
    workerCount: newWorkerCount,
    maxWorkerCapacity,
    workerSatisfaction: newSatisfaction,
    workerHealth: newHealth,
    weeklyMigration: migration,
    buildingMaintenance,
    financialHistory: [...state.financialHistory, financialRecord].slice(-10), // Keep last 10 weeks
    townScale,
    isCeremonyActive: true, // Activate the ceremony modal
  };
};

export const updateGameState = (state: GameState): GameState => {
  // Check if game is paused
  if (state.isPaused || state.isGameOver || state.isCeremonyActive) {
    return state;
  }
  
  // Increment day
  let currentDay = state.currentDay + 1;
  let currentWeek = state.currentWeek;
  let isCeremonyActive = false;
  
  // If a week has passed, trigger the weekly ceremony
  if (currentDay > 7) {
    return processWeeklyCeremony(state);
  }
  
  // Return updated state
  return {
    ...state,
    currentDay,
    currentWeek,
    isCeremonyActive
  };
};

export const constructBuilding = (
  state: GameState,
  buildingType: BuildingType
): GameState => {
  // Find the building template
  const buildingTemplate = state.buildings.find(
    b => b.type === buildingType && b.constructionProgress < 100
  );
  
  if (!buildingTemplate || state.treasury < buildingTemplate.constructionCost) {
    return state;
  }
  
  // Update the building's construction progress to 100% and mark as operational
  const updatedBuildings = state.buildings.map(building => {
    if (building.id === buildingTemplate.id) {
      return {
        ...building,
        constructionProgress: 100,
        isOperational: true
      };
    }
    return building;
  });
  
  // Deduct the construction cost from the treasury
  const treasury = state.treasury - buildingTemplate.constructionCost;
  
  // Recalculate max worker capacity
  const maxWorkerCapacity = calculateMaxWorkerCapacity(updatedBuildings);
  
  return {
    ...state,
    buildings: updatedBuildings,
    treasury,
    maxWorkerCapacity
  };
};

export const assignWorkers = (
  state: GameState,
  buildingId: string,
  workerCount: number
): GameState => {
  // Ensure worker count is valid
  const building = state.buildings.find(b => b.id === buildingId);
  if (!building || !building.isOperational) {
    return state;
  }
  
  // Calculate total currently assigned workers
  const totalAssignedWorkers = Object.values(state.workerAssignments).reduce(
    (sum, count) => sum + count,
    0
  );
  
  // Check if we have enough unassigned workers
  const currentlyAssigned = state.workerAssignments[buildingId] || 0;
  const workerDifference = workerCount - currentlyAssigned;
  const unassignedWorkers = state.workerCount - totalAssignedWorkers;
  
  if (workerDifference > unassignedWorkers) {
    return state;
  }
  
  // Ensure we don't exceed building capacity
  const assignedWorkers = Math.min(workerCount, building.workerCapacity);
  
  // Update worker assignments
  const workerAssignments = {
    ...state.workerAssignments,
    [buildingId]: assignedWorkers
  };
  
  // Update the building's assigned workers
  const buildings = state.buildings.map(b => {
    if (b.id === buildingId) {
      return {
        ...b,
        assignedWorkers
      };
    }
    return b;
  });
  
  return {
    ...state,
    workerAssignments,
    buildings
  };
};

export const setSalary = (state: GameState, salary: number): GameState => {
  return {
    ...state,
    salary: Math.max(10, Math.min(100, salary)) // Clamp between 10-100
  };
};

export const setGameSpeed = (state: GameState, speed: GameSpeed): GameState => {
  return {
    ...state,
    gameSpeed: speed,
    isPaused: speed === GameSpeed.PAUSED
  };
};

export const closeCeremony = (state: GameState): GameState => {
  return {
    ...state,
    isCeremonyActive: false
  };
};

export const acknowledgeIntro = (state: GameState): GameState => {
  return {
    ...state,
    hasSeenIntro: true
  };
}; 