import { GameState, Worker, GameSpeed, NotificationType, TutorialStage, GameDate } from '../types/game';
import { INITIAL_STATE, GAME_PARAMETERS } from '../constants/gameConstants';
import { v4 as uuidv4 } from 'uuid';
import { GameAction } from './GameContext';

export function gameReducer(state: GameState, action: GameAction): GameState {
  console.log('Reducer called with action:', action.type, action.payload);
  
  switch (action.type) {
    case 'SET_SALARY':
      return {
        ...state,
        salary: action.payload
      };
      
    case 'NEW_GAME':
      return {
        ...state,
        salary: GAME_PARAMETERS.MIN_WAGE,
        tutorial: {
          ...state.tutorial,
          stage: 'Introduction',
          completed: false
        }
      };
      
    case 'SET_TUTORIAL_STAGE':
      return {
        ...state,
        tutorial: {
          ...state.tutorial,
          stage: action.payload
        }
      };
      
    default:
      console.log('Unknown action type:', action.type);
      return state;
  }
}

function calculateWorkerMigration(salary: number): number {
  const migration = Math.floor((salary - 10) / (100 - 10) * 50);
  return Math.max(0, migration);
}

function generateWorkers(count: number): Worker[] {
  const newWorkers: Worker[] = [];
  
  for (let i = 0; i < count; i++) {
    newWorkers.push({
      id: uuidv4(),
      name: generateWorkerName(),
      role: randomWorkerRole(),
      health: 80 + Math.floor(Math.random() * 21),
      satisfaction: 60 + Math.floor(Math.random() * 31),
      productivity: 0.8 + (Math.random() * 0.4),
      salary: 0,
      daysEmployed: 0,
      skills: [],
      journal: [],
    });
  }
  
  return newWorkers;
}

function calculateProduction(workers: Worker[], buildings: Building[]): number {
  let totalProduction = 0;
  
  const mines = buildings.filter(b => b.type === 'Mine');
  
  mines.forEach(mine => {
    const mineWorkers = workers.filter(w => mine.workers.includes(w.id));
    
    mineWorkers.forEach(worker => {
      totalProduction += worker.productivity;
    });
    
    totalProduction *= (1 + (mine.level * 0.25));
  });
  
  return Math.round(totalProduction * 100) / 100;
}

function calculateRevenue(production: number, mineralPrice: number): number {
  return Math.round(production * mineralPrice);
}

function calculateExpenses(workers: Worker[], baseSalary: number): number {
  return workers.length * baseSalary;
}

function calculateAverageSatisfaction(workers: Worker[]): number {
  if (workers.length === 0) return 0;
  
  const totalSatisfaction = workers.reduce((sum, worker) => sum + worker.satisfaction, 0);
  return Math.round((totalSatisfaction / workers.length) * 10) / 10;
}

function fluctuateMineralPrice(currentPrice: number): number {
  const fluctuation = (Math.random() * 0.2) - 0.1;
  const newPrice = currentPrice * (1 + fluctuation);
  return Math.round(newPrice * 100) / 100;
}

function generateWorkerName(): string {
  const firstNames = ['John', 'William', 'Thomas', 'George', 'James', 'Charles', 'Henry', 'Joseph', 'Samuel', 'Robert'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function randomWorkerRole() {
  const roles = ['Miner', 'Builder', 'Service', 'Management'];
  return roles[Math.floor(Math.random() * roles.length)];
}

function advanceGameDate(date: GameDate): GameDate {
  let { year, month, day, dayOfWeek } = date;
  
  day += 7; // Advance a week
  dayOfWeek = (dayOfWeek + 7) % 7;
  
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) {
    day -= daysInMonth;
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  
  return { year, month, day, dayOfWeek };
} 