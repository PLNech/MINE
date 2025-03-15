import { GameState } from '../types/game';

const GAME_SAVE_KEY = 'thisTownIsMine_save';

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(GAME_SAVE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}

export function loadGame(): GameState | null {
  try {
    const saved = localStorage.getItem(GAME_SAVE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
} 