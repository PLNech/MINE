
import { GameState, TutorialStage } from '../types/game';
import { INITIAL_STATE } from '../constants/gameConstants';
import { v4 as uuidv4 } from 'uuid';
import { GameAction } from './GameContext';

export function gameReducer(state: GameState, action: GameAction): GameState {
  console.log('gameReducer: Processing action:', action.type, action.payload);
  
  switch (action.type) {
    case 'SET_SALARY': {
      const newSalary = Number(action.payload);
      console.log('gameReducer: Setting salary from', state.salary, 'to', newSalary);
      
      // Create completely new state object with updated salary
      return {
        ...state,
        salary: newSalary
      };
    }
      
    case 'NEW_GAME':
      console.log('gameReducer: Starting new game');
      return { ...INITIAL_STATE };
      
    case 'SET_TUTORIAL_STAGE':
      console.log('gameReducer: Setting tutorial stage to', action.payload);
      return {
        ...state,
        tutorial: {
          ...state.tutorial,
          stage: action.payload
        }
      };
      
    case 'UPDATE_TUTORIAL_CONDITION':
      console.log('gameReducer: Updating tutorial condition', action.payload);
      return {
        ...state,
        tutorial: {
          ...state.tutorial,
          conditions: {
            ...state.tutorial.conditions,
            [action.payload.condition]: action.payload.value
          }
        }
      };
      
    case 'LOAD_GAME':
      console.log('gameReducer: Loading saved game');
      return {
        ...action.payload
      };
      
    case 'ADVANCE_WEEK':
      // Add implementation here if needed
      return state;
      
    default:
      console.warn('gameReducer: Unknown action type:', action.type);
      return state;
  }
}