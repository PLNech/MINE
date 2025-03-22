import { Upgrade, UpgradeType } from '../types/types';

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'mine-capacity',
    type: UpgradeType.MINE_CAPACITY,
    name: 'Mine Expansion',
    description: 'Increase the maximum number of workers your mine can support.',
    maxLevel: 4,
    currentLevel: 0,
    baseCost: 1000,
    costMultiplier: 2, // Cost doubles each level
    effect: {
      type: 'mineCapacity',
      valuePerLevel: 10 // +10 workers per level
    }
  },
  {
    id: 'market-stability',
    type: UpgradeType.MARKET_STABILITY,
    name: 'Market Influence',
    description: 'Reduce price volatility in the mineral market through strategic relationships.',
    maxLevel: 5,
    currentLevel: 0,
    baseCost: 1500,
    costMultiplier: 2.5, // More aggressive scaling
    effect: {
      type: 'priceStability',
      valuePerLevel: 10 // 10% reduction in volatility per level
    }
  },
  {
    id: 'housing-efficiency',
    type: UpgradeType.HOUSING_EFFICIENCY,
    name: 'Housing Optimization',
    description: 'Improve the capacity of all housing structures through better design and management.',
    maxLevel: 5,
    currentLevel: 0,
    baseCost: 1200,
    costMultiplier: 2.2,
    effect: {
      type: 'housingEfficiency',
      valuePerLevel: 20 // 20% increase in housing capacity per level
    }
  }
]; 