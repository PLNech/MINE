import { Building, BuildingType, EffectType, TownScale } from '../types/types';

export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'mine-1',
    type: BuildingType.MINE,
    name: 'Iron Mine',
    constructionProgress: 100, // Already built
    constructionCost: 0, // Free (starting building)
    isOperational: true,
    maintenanceCost: 100,
    workerCapacity: 50,
    assignedWorkers: 0,
    effects: [
      {
        type: EffectType.PRODUCTIVITY,
        value: 100 // Base productivity
      },
      {
        type: EffectType.HEALTH,
        value: -10 // Mines reduce health
      }
    ],
    description: 'The heart of your operation. Workers extract valuable ore from the depths of the earth.',
  },
  {
    id: 'barracks-1',
    type: BuildingType.BARRACKS,
    name: 'Worker Barracks',
    constructionProgress: 0, // Needs to be built
    constructionCost: 500,
    isOperational: false,
    maintenanceCost: 50,
    workerCapacity: 0, // No workers assigned here
    assignedWorkers: 0,
    effects: [
      {
        type: EffectType.HOUSING,
        value: 10 // Houses 10 workers
      },
      {
        type: EffectType.SATISFACTION,
        value: -10 // Barracks reduce satisfaction
      }
    ],
    description: 'Basic communal housing for your laborers. Cramped but functional.',
  },
  {
    id: 'house-1',
    type: BuildingType.HOUSE,
    name: 'Worker Cottages',
    constructionProgress: 0,
    constructionCost: 1000,
    isOperational: false,
    maintenanceCost: 100,
    workerCapacity: 0,
    assignedWorkers: 0,
    effects: [
      {
        type: EffectType.HOUSING,
        value: 20
      },
      {
        type: EffectType.SATISFACTION,
        value: 10
      }
    ],
    description: 'Simple family housing. A step up from the barracks.',
    unlockRequirement: {
      townScale: TownScale.SETTLEMENT
    }
  },
  {
    id: 'infirmary-1',
    type: BuildingType.INFIRMARY,
    name: 'Company Infirmary',
    constructionProgress: 0,
    constructionCost: 1500,
    isOperational: false,
    maintenanceCost: 200,
    workerCapacity: 5,
    assignedWorkers: 0,
    effects: [
      {
        type: EffectType.HEALTH,
        value: 15
      },
      {
        type: EffectType.SATISFACTION,
        value: 5
      }
    ],
    description: 'A basic medical facility to patch up your workers.',
    unlockRequirement: {
      townScale: TownScale.SETTLEMENT
    }
  },
  {
    id: 'canteen-1',
    type: BuildingType.CANTEEN,
    name: 'Company Canteen',
    constructionProgress: 0,
    constructionCost: 1000,
    isOperational: false,
    maintenanceCost: 150,
    workerCapacity: 5,
    assignedWorkers: 0,
    effects: [
      {
        type: EffectType.SATISFACTION,
        value: 15
      },
      {
        type: EffectType.HEALTH,
        value: 5
      }
    ],
    description: 'A place for workers to eat and socialize.',
    unlockRequirement: {
      townScale: TownScale.SETTLEMENT
    }
  },
  {
    id: 'school-1',
    type: BuildingType.SCHOOL,
    name: 'Company School',
    constructionProgress: 0,
    constructionCost: 2000,
    isOperational: false,
    maintenanceCost: 250,
    workerCapacity: 5,
    assignedWorkers: 0,
    effects: [
      {
        type: EffectType.PRODUCTIVITY,
        value: 20
      },
      {
        type: EffectType.SATISFACTION,
        value: 10
      }
    ],
    description: 'Educate the workforce to increase efficiency.',
    unlockRequirement: {
      townScale: TownScale.VILLAGE
    }
  },
  {
    id: 'store-1',
    type: BuildingType.STORE,
    name: 'Company Store',
    constructionProgress: 0,
    constructionCost: 1500,
    isOperational: false,
    maintenanceCost: 200,
    workerCapacity: 5,
    assignedWorkers: 0,
    effects: [
      {
        type: EffectType.SATISFACTION,
        value: 10
      },
      {
        type: EffectType.PRODUCTIVITY,
        value: 5
      }
    ],
    description: 'Sell goods to your workers at... reasonable prices.',
    unlockRequirement: {
      townScale: TownScale.SETTLEMENT
    }
  },
  {
    id: 'barracks',
    name: 'Barracks',
    type: BuildingType.BARRACKS,
    description: 'Provides basic housing for your workers.',
    constructionCost: 500,
    maintenanceCost: 100,
    effects: [
      {
        type: EffectType.HOUSING,
        value: 20
      },
      {
        type: EffectType.HEALTH,
        value: -5
      },
      {
        type: EffectType.SATISFACTION,
        value: -5
      }
    ],
    workerCapacity: 0, // Barracks don't need workers
    assignedWorkers: 0,
    isOperational: false,
    constructionProgress: 0,
    maxCount: 5, // Can build up to 5 barracks
    currentCount: 0,
  },
]; 