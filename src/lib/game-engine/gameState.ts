import { Building, BuildingType, EffectType, FinancialRecord, GameSpeed, GameState, TownScale, Upgrade, UpgradeType } from '../types/types';
import { INITIAL_BUILDINGS } from '../constants/buildings';
import { INITIAL_UPGRADES } from '../constants/upgrades';

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
  
  // Upgrades
  upgrades: INITIAL_UPGRADES,
  
  // Daily economic tracking
  dailyTransactions: [],
  todayExtraction: 0,
  todayRevenue: 0,
  todayExpenses: 0,
};

export const calculateTownScale = (workerCount: number): TownScale => {
  if (workerCount < 5) return TownScale.CAMP;
  if (workerCount <= 20) return TownScale.CAMP;
  if (workerCount <= 50) return TownScale.SETTLEMENT;
  if (workerCount <= 100) return TownScale.VILLAGE;
  if (workerCount <= 250) return TownScale.TOWN;
  return TownScale.CITY;
};

export const calculateMaxWorkerCapacity = (buildings: Building[], upgrades: Upgrade[]): number => {
  // Find housing efficiency upgrade
  const housingUpgrade = upgrades.find(u => u.type === UpgradeType.HOUSING_EFFICIENCY);
  let housingMultiplier = 1.0; // Default multiplier
  
  if (housingUpgrade && housingUpgrade.currentLevel > 0) {
    // Each level increases capacity by 20%
    housingMultiplier = 1.0 + (housingUpgrade.currentLevel * 0.2);
  }
  
  return buildings.reduce((capacity, building) => {
    if (building.isOperational) {
      const housingEffect = building.effects.find(effect => effect.type === EffectType.HOUSING);
      if (housingEffect) {
        return capacity + Math.floor(housingEffect.value * housingMultiplier);
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

export const calculateMineralPrice = (state: GameState): number => {
  // Find market stability upgrade
  const marketStabilityUpgrade = state.upgrades.find(u => u.type === UpgradeType.MARKET_STABILITY);
  
  // Calculate price stability modifier (reduced fluctuation)
  let fluctuation = 0.2; // Default 20%
  if (marketStabilityUpgrade && marketStabilityUpgrade.currentLevel > 0) {
    // Each level reduces fluctuation by 2% (10% of the base 20%)
    fluctuation = 0.2 - (0.02 * marketStabilityUpgrade.currentLevel);
  }
  
  // Base price with random fluctuation
  const basePrice = 50;
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
  const maxWorkerCapacity = calculateMaxWorkerCapacity(state.buildings, state.upgrades);
  
  // Calculate building maintenance
  const buildingMaintenance = calculateMaintenance(state.buildings);
  
  // Calculate productivity
  const productivity = calculateProductivity(
    state.workerHealth,
    state.workerSatisfaction,
    state.buildings
  );
  
  // Calculate mineral price (fluctuates weekly)
  const mineralPrice = calculateMineralPrice(state);
  
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
  const newFinancialRecord: FinancialRecord = {
    week: state.currentWeek,
    revenue: weeklyRevenue,
    expenses: weeklyExpenses,
    profit: weeklyProfit,
    treasury,
    workerCount: newWorkerCount,
    workerSatisfaction: newSatisfaction,
    workerHealth: newHealth,
    mineralPrice,
    mineralExtraction: state.totalMineralExtraction,
    production,
    efficiency: state.baseProductionPerWorker * 
      (0.5 + (newSatisfaction * 0.25) / 100 + (newHealth * 0.25) / 100),
    avgDailyProduction: state.todayExtraction / state.currentDay
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
    financialHistory: [...state.financialHistory, newFinancialRecord].slice(-10), // Keep last 10 weeks
    townScale,
    isCeremonyActive: true, // Activate the ceremony modal
  };
};

export const updateGameState = (state: GameState): GameState => {
  if (state.isGameOver) return state;
  
  let nextDay = state.currentDay + 1;
  let nextWeek = state.currentWeek;
  let isCeremonyActive = false;
  
  // Check if we've reached the end of the week (7 days)
  if (nextDay > 7) {
    nextDay = 1;
    nextWeek = state.currentWeek + 1;
    isCeremonyActive = true;
  }
  
  // Calculate daily extraction and revenue
  const dailyExtraction = calculateDailyExtraction(state);
  const updatedMineralPrice = calculateDailyMineralPrice(state);
  const dailyRevenue = dailyExtraction * updatedMineralPrice;
  
  // Daily maintenance expense - 1/7th of the weekly maintenance
  const dailyMaintenance = state.buildingMaintenance / 7;
  
  // Keep track of salaries only on day 7
  const salaryCost = nextDay === 1 ? state.workerCount * state.salary : 0;
  
  // Calculate net change for today
  const netChange = dailyRevenue - dailyMaintenance - (nextDay === 1 ? salaryCost : 0);
  
  // Create transaction record
  const todayTransaction: DailyTransaction = {
    day: state.currentDay,
    week: state.currentWeek,
    mineralExtraction: dailyExtraction,
    revenue: dailyRevenue,
    expenses: {
      maintenance: dailyMaintenance,
      ...(nextDay === 1 ? { salaries: salaryCost } : {})
    },
    mineralPrice: updatedMineralPrice,
    netChange: netChange
  };
  
  // Update the state with the new day and transaction
  let updatedState = {
    ...state,
    currentDay: nextDay,
    currentWeek: nextWeek,
    isCeremonyActive,
    currentMineralPrice: updatedMineralPrice,
    todayExtraction: dailyExtraction,
    todayRevenue: dailyRevenue,
    todayExpenses: dailyMaintenance + (nextDay === 1 ? salaryCost : 0),
    treasury: state.treasury + netChange,
    totalMineralExtraction: state.totalMineralExtraction + dailyExtraction,
    dailyTransactions: [...state.dailyTransactions, todayTransaction].slice(-28) // Keep last 28 days (4 weeks)
  };
  
  // If it's the end of the week, process the weekly ceremony
  if (isCeremonyActive) {
    updatedState = processWeeklyCeremony(updatedState);
  }
  
  return updatedState;
};

export const constructBuilding = (state: GameState, buildingType: BuildingType): GameState => {
  // Find the building in the available buildings
  const buildingToBuild = state.buildings.find(b => b.type === buildingType && !b.isOperational);
  
  // If building not found or insufficient funds, return state unchanged
  if (!buildingToBuild || state.treasury < buildingToBuild.constructionCost) {
    return state;
  }
  
  // Check if we've reached the maximum count for this building type
  if (buildingToBuild.maxCount !== undefined) {
    const currentCount = state.buildings.filter(b => 
      b.type === buildingType && b.isOperational
    ).length;
    
    if (currentCount >= buildingToBuild.maxCount) {
      return state;
    }
  }
  
  // Create a new building ID for multiple instances
  const newBuildingId = `${buildingToBuild.id}-${Date.now()}`;
  
  // Create a new building object
  const newBuilding: Building = {
    ...buildingToBuild,
    id: newBuildingId,
    constructionProgress: 100, // Instantly complete construction for simplicity
    isOperational: true,
    currentCount: (buildingToBuild.currentCount || 0) + 1
  };
  
  // Update the buildings array with the new building and update the original template
  const updatedBuildings = state.buildings.map(building => {
    if (building.id === buildingToBuild.id) {
      return {
        ...building,
        currentCount: (building.currentCount || 0) + 1
      };
    }
    return building;
  }).concat(newBuilding);
  
  // Update the state with the new building and reduced treasury
  return {
    ...state,
    buildings: updatedBuildings,
    treasury: state.treasury - buildingToBuild.constructionCost,
    buildingMaintenance: state.buildingMaintenance + newBuilding.maintenanceCost
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

export const purchaseUpgrade = (state: GameState, upgradeId: string): GameState => {
  const upgrade = state.upgrades.find(u => u.id === upgradeId);
  
  if (!upgrade || upgrade.currentLevel >= upgrade.maxLevel || state.treasury < calculateUpgradeCost(upgrade)) {
    return state;
  }
  
  const cost = calculateUpgradeCost(upgrade);
  
  // Update the upgrade's level
  const updatedUpgrades = state.upgrades.map(u => {
    if (u.id === upgradeId) {
      return {
        ...u,
        currentLevel: u.currentLevel + 1
      };
    }
    return u;
  });
  
  // Apply upgrade effects
  let updatedState = {
    ...state,
    upgrades: updatedUpgrades,
    treasury: state.treasury - cost
  };
  
  // Apply specific upgrade effects
  if (upgrade.type === UpgradeType.MINE_CAPACITY) {
    // Update mine capacity
    updatedState = {
      ...updatedState,
      buildings: updatedState.buildings.map(building => {
        if (building.type === BuildingType.MINE) {
          return {
            ...building,
            workerCapacity: building.workerCapacity + upgrade.effect.valuePerLevel
          };
        }
        return building;
      })
    };
  }
  
  return updatedState;
};

export const calculateUpgradeCost = (upgrade: Upgrade): number => {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.currentLevel));
};

// Add daily mineral price fluctuation function
export const calculateDailyMineralPrice = (state: GameState): number => {
  // Find market stability upgrade
  const marketStabilityUpgrade = state.upgrades.find(u => u.type === UpgradeType.MARKET_STABILITY);
  
  // Calculate price stability modifier (reduced fluctuation)
  let fluctuation = 0.05; // Daily fluctuation is smaller than weekly (5% instead of 20%)
  if (marketStabilityUpgrade && marketStabilityUpgrade.currentLevel > 0) {
    // Each level reduces fluctuation
    fluctuation = 0.05 - (0.005 * marketStabilityUpgrade.currentLevel);
  }
  
  // Base price with random fluctuation
  const basePrice = state.currentMineralPrice;
  const randomFactor = 1 + (Math.random() * fluctuation * 2 - fluctuation);
  return Math.round(basePrice * randomFactor);
};

// Calculate daily mineral extraction
export const calculateDailyExtraction = (state: GameState): number => {
  // Get mine building
  const mine = state.buildings.find(b => b.type === BuildingType.MINE);
  if (!mine || !mine.isOperational) return 0;
  
  // Calculate production
  const workerProductivity = calculateProductivity(
    state.workerHealth,
    state.workerSatisfaction,
    state.buildings
  );
  
  return mine.assignedWorkers * state.baseProductionPerWorker * workerProductivity;
};

export const calculateProductionStats = (state: GameState) => {
  // Use a stable calculation method that won't change between server and client
  const productionData = state.financialHistory.map(record => ({
    date: new Date(record.date),
    value: record.production
  }));

  const industryAvgProduction = state.financialHistory.map(record => ({
    date: new Date(record.date),
    value: record.industryAverage || record.production * 1.1 // fallback calculation
  }));

  return {
    productionData,
    industryAvgProduction
  };
}; 