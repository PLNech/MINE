'use client';

import { createContext, useContext, useEffect, useReducer } from 'react';
import { GameState } from '../types/game';
import { gameReducer } from './gameReducer';
import { loadGame, saveGame } from '../utils/storage';
import { INITIAL_STATE } from '../constants/gameConstants';

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<any>;
}>({ state: INITIAL_STATE, dispatch: () => null });

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  useEffect(() => {
    const savedGame = loadGame();
    if (savedGame) {
      dispatch({ type: 'LOAD_GAME', payload: savedGame });
    }
  }, []);

  useEffect(() => {
    saveGame(state);
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext); 