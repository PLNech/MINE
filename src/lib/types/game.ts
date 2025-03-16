export interface GameState {
  version: string;
  startDate: number;
  currentWeek: number;
  treasury: number;
  workers: Worker[];
  buildings: Building[];
  economy: Economy;
  townScale: TownScale;
  salary: number;
  weeklyHistory: WeeklyRecord[];
  tutorial: TutorialState;
  notifications: Notification[];
  gameSpeed: GameSpeed;
  secretary: SecretaryState;
  gameDate: GameDate;
}

export interface Worker {
  id: string;
  name: string;
  role: WorkerRole;
  health: number;          // 0-100 scale
  satisfaction: number;    // 0-100 scale
  productivity: number;    // Affected by health and satisfaction
  salary: number;         // Weekly pay
  daysEmployed: number;   // Tenure tracking
  skills: WorkerSkill[];  // Specialized abilities
  family?: FamilyMember[]; // Connections for narrative events
  journal: JournalEntry[]; // Personal story entries
}

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  condition: number;
  workers: string[]; // Worker IDs
  position: Position;
}

export interface Economy {
  treasury: number;
  weeklyRevenue: number;
  weeklyExpenses: number;
  mineralPrice: number;
  priceFluctuation: number;
}

export interface Position {
  x: number;
  y: number;
  rotation: number;
}

export enum TownScale {
  CAMP = 'Camp',
  SETTLEMENT = 'Settlement',
  VILLAGE = 'Village',
  TOWN = 'Town',
  CITY = 'City',
  METROPOLIS = 'Metropolis'
}

export enum WorkerRole {
  MINER = 'Miner',
  BUILDER = 'Builder',
  SERVICE = 'Service',
  MANAGEMENT = 'Management'
}

export enum BuildingType {
  MINE = 'Mine',
  HOUSING = 'Housing',
  STORE = 'Store',
  HOSPITAL = 'Hospital'
}

export interface JournalEntry {
  week: number;
  text: string;
  type: JournalEntryType;
  tone: EntryTone;
}

export type JournalEntryType = 'personal' | 'work' | 'town' | 'family';
export type EntryTone = 'hopeful' | 'neutral' | 'concerned' | 'angry' | 'desperate';

export interface WorkerSkill {
  type: SkillType;
  level: number;          // 1-5 scale
  experience: number;     // Progress to next level
}

export type SkillType = 'mining' | 'construction' | 'management' | 'trade';

export interface FamilyMember {
  id: string;
  relation: FamilyRelation;
  name: string;
  age: number;
  health: number;
}

export type FamilyRelation = 'spouse' | 'child' | 'parent' | 'sibling';

export interface WeeklyRecord {
  week: number;
  treasury: number;
  revenue: number;
  expenses: number;
  workerCount: number;
  averageSatisfaction: number;
  production: number;
}

export interface TutorialState {
  stage: TutorialStage;
  completed: boolean;
  currentStep: number;
  conditions: TutorialConditions;
}

export interface TutorialConditions {
  hasViewedWorkers: boolean;
  hasAdjustedSalary: boolean;
  hasSalaryUiShown: boolean;
  hasAssignedWorker: boolean;
  hasViewedTreasury: boolean;
  hasBuiltBarracks: boolean;
  hasAdvancedWeek: boolean;
}

export enum TutorialStage {
  INTRODUCTION = 'Introduction',
  SALARY_SETTING = 'Salary Setting',
  WORKER_MANAGEMENT = 'Worker Management',
  BUILDING_CONSTRUCTION = 'Building Construction',
  COMPLETED = 'Completed'
}

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  read: boolean;
  week: number;
}

export enum NotificationType {
  INFO = 'Info',
  WARNING = 'Warning',
  CRITICAL = 'Critical',
  EVENT = 'Event'
}

export enum GameSpeed {
  PAUSED = 'Paused',
  NORMAL = 'Normal',
  FAST = 'Fast'
}

export interface SecretaryState {
  currentMessage: string;
  messageHistory: string[];
}

export type GameDate = {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number;
}; 