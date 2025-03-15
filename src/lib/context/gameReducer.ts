import { GameState } from '../types/game';
import { INITIAL_STATE } from '../constants/gameConstants';

type GameAction = 
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'ADVANCE_WEEK' }
  | { type: 'NEW_GAME' };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_GAME':
      return action.payload;
    case 'ADVANCE_WEEK':
      return {
        ...state,
        currentWeek: state.currentWeek + 1
      };
    case 'NEW_GAME':
      return {
        ...INITIAL_STATE,
        startDate: Date.now()
      };
    default:
      return state;
  }
} 