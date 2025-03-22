'use client';

import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { GameSpeed, GameState, BuildingType } from '../types/types';
import { INITIAL_GAME_STATE, assignWorkers, closeCeremony, constructBuilding, setSalary, setGameSpeed, updateGameState, acknowledgeIntro } from '../game-engine/gameState';

type GameAction =
  | { type: 'UPDATE_STATE' }
  | { type: 'SET_SALARY'; payload: number }
  | { type: 'SET_GAME_SPEED'; payload: GameSpeed }
  | { type: 'CONSTRUCT_BUILDING'; payload: BuildingType }
  | { type: 'ASSIGN_WORKERS'; payload: { buildingId: string; workerCount: number } }
  | { type: 'CLOSE_CEREMONY' }
  | { type: 'ACKNOWLEDGE_INTRO' }
  | { type: 'LOAD_SAVE'; payload: GameState };

type GameDispatch = (action: GameAction) => void;

const GameContext = createContext<{ state: GameState; dispatch: GameDispatch } | undefined>(undefined);

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_STATE':
      return updateGameState(state);
    case 'SET_SALARY':
      return setSalary(state, action.payload);
    case 'SET_GAME_SPEED':
      return setGameSpeed(state, action.payload);
    case 'CONSTRUCT_BUILDING':
      return constructBuilding(state, action.payload);
    case 'ASSIGN_WORKERS':
      return assignWorkers(
        state,
        action.payload.buildingId,
        action.payload.workerCount
      );
    case 'CLOSE_CEREMONY':
      return closeCeremony(state);
    case 'ACKNOWLEDGE_INTRO':
      return acknowledgeIntro(state);
    case 'LOAD_SAVE':
      return action.payload;
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  // Try to load saved game state from localStorage
  const loadSavedState = (): GameState => {
    if (typeof window === 'undefined') return INITIAL_GAME_STATE;
    
    try {
      const savedState = localStorage.getItem('gameState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Failed to load saved game state:', error);
    }
    
    return INITIAL_GAME_STATE;
  };
  
  const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE, loadSavedState);
  
  // Game loop
  useEffect(() => {
    if (state.gameSpeed === GameSpeed.PAUSED || state.isGameOver || state.isCeremonyActive) {
      return;
    }
    
    const tickInterval = 1000 / state.gameSpeed; // Faster speed = shorter interval
    const intervalId = setInterval(() => {
      dispatch({ type: 'UPDATE_STATE' });
    }, tickInterval);
    
    return () => clearInterval(intervalId);
  }, [state.gameSpeed, state.isGameOver, state.isCeremonyActive]);
  
  // Save game state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gameState', JSON.stringify(state));
    }
  }, [state]);
  
  const value = { state, dispatch };
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameState() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
} 