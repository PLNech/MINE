// src/lib/context/GameContext.tsx
'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { GameState } from '../types/game';
import { gameReducer } from './gameReducer';
import { INITIAL_STATE } from '../constants/gameConstants';

// 1. Define the action types explicitly
export type GameAction = {
  type: 'SET_SALARY' | 'NEW_GAME' | 'ADVANCE_WEEK' | 'SET_TUTORIAL_STAGE' | 'UPDATE_TUTORIAL_CONDITION' | 'LOAD_GAME';
  payload?: any;
};

// 2. Define the context type
type GameContextType = {
  state: GameState;
  dispatch: (action: GameAction) => void;
};

// 3. Create the context with a meaningful default value
const GameContext = createContext<GameContextType | null>(null);

// 4. Create a provider component
export function GameProvider({ children }: { children: ReactNode }) {
  // Load saved game state or use initial state
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  // Log state changes for debugging
  useEffect(() => {
    console.log('GameContext: state updated, salary =', state.salary);
  }, [state.salary]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// 5. Hook for using the context
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}