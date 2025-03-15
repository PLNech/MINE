import { GameState, TownScale } from '../types/game';

export const INITIAL_STATE: GameState = {
  version: '0.1.0',
  startDate: Date.now(),
  currentWeek: 1,
  treasury: 1000,
  workers: [],
  buildings: [],
  economy: {
    treasury: 1000,
    weeklyRevenue: 0,
    weeklyExpenses: 0,
    mineralPrice: 50,
    priceFluctuation: 0
  },
  townScale: TownScale.CAMP
};

export const GAME_PARAMETERS = {
  STARTING_TREASURY: 1000,
  BASE_MINERAL_PRICE: 50,
  MIN_WAGE: 10,
  MAX_WAGE: 100,
  MIGRATION_FACTOR: 50,
  WORKER_SATISFACTION_THRESHOLD: 50
}; 