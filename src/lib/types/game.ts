export interface GameState {
  version: string;
  startDate: number;
  currentWeek: number;
  treasury: number;
  workers: Worker[];
  buildings: Building[];
  economy: Economy;
  townScale: TownScale;
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