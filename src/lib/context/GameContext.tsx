'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState } from '../types/game';
import { gameReducer } from './gameReducer';
import { INITIAL_STATE, GAME_PARAMETERS } from '../constants/gameConstants';

// 1. Define the action types explicitly
export type GameAction = {
  type: 'SET_SALARY' | 'NEW_GAME' | 'ADVANCE_WEEK' | 'SET_TUTORIAL_STAGE';
  payload?: any;
};

// 2. Define the context type
type GameContextType = {
  state: GameState;
  dispatch: (action: GameAction) => void;
};

// 3. Create the context with a meaningful default value
const GameContext = createContext<GameContextType | null>(null);

// 4. Create a simple provider component
export function GameProvider({ children }: { children: ReactNode }) {
  // Initialize with a valid starting state
  const initialState: GameState = {
    ...INITIAL_STATE,
    salary: GAME_PARAMETERS.MIN_WAGE,
    version: '1.0',
    startDate: Date.now(),
    currentWeek: 1,
    treasury: 1000,
    workers: [],
    buildings: [],
    economy: {
      treasury: 1000,
      weeklyRevenue: 0,
      weeklyExpenses: 0,
      mineralPrice: 10,
      priceFluctuation: 0
    },
    townScale: 'Camp',
    weeklyHistory: [],
    tutorial: {
      stage: 'Introduction',
      completed: false,
      currentStep: 1,
      conditions: {
        hasViewedWorkers: false,
        hasAdjustedSalary: false,
        hasSalaryUiShown: false,
        hasAssignedWorker: false,
        hasViewedTreasury: false,
        hasBuiltBarracks: false,
        hasAdvancedWeek: false
      }
    },
    notifications: [],
    gameSpeed: 'NORMAL',
    secretary: {
      currentMessage: '',
      messageHistory: []
    },
    gameDate: {
      year: 1890,
      month: 1,
      day: 1,
      dayOfWeek: 1
    }
  };

  // 5. Simple reducer setup
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // 6. Provide the context value
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// 7. Create a simple hook for using the context
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 