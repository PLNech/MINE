# This Town Is Mine - Product Requirements Document
## Part 1: Specifications

## 1. Overview

### 1.1 Product Description
"This Town Is Mine" is an incremental management simulation game where players assume the role of a 19th-century capitalist who establishes and develops a company town around a newly acquired mine. The game features a distinctive robber baron aesthetic with a sepia-toned, paper-like interface that evolves in detail and complexity as the town grows.

### 1.2 Target Platform
- Primary: Web browsers (desktop)
- Secondary: Web browsers (mobile/tablet)
- Technology Stack: Next.js with App Router, TypeScript, React, Tailwind CSS
- Deployment: Vercel

### 1.3 MVP Scope
The Minimum Viable Product (MVP) will focus on core gameplay mechanics and aesthetic, excluding online features except for shareable achievements via encoded URLs.

### 1.4 Core Game Philosophy
- Start extremely simple with a single interaction (salary slider)
- Progressive revelation of mechanics as town grows
- Visual evolution paralleling gameplay complexity
- Inevitable failure with insights for future attempts
- Clear cause-and-effect relationships that become increasingly complex
- "Pet to cattle" transition in worker management

## 2. Technical Requirements

### 2.1 Architecture

#### 2.1.1 Frontend Framework
- Next.js with App Router
- React 18+ for component-based UI
- TypeScript for type safety and maintainability
- Tailwind CSS for styling

#### 2.1.2 State Management
- React Context API for global state management
- Local Storage for game save data persistence
- URL query parameters for achievement sharing

#### 2.1.3 Project Structure
```
/app
  /page.tsx              # Landing/intro page
  /game/page.tsx         # Main game container
  /achievements/page.tsx # Achievement display page
  /layout.tsx            # Main layout with common elements
  /api/                  # API routes if needed
/components
  /ui/                   # Reusable UI components
  /game/                 # Game-specific components
  /achievements/         # Achievement-related components
  /animations/           # Animation components
/lib
  /game-engine/          # Core game logic
  /utils/                # Utility functions
  /hooks/                # Custom React hooks
  /types/                # TypeScript type definitions
  /constants/            # Game constants and configurations
/public
  /images/               # Static images
  /fonts/                # Custom fonts
  /sounds/               # Game sounds and effects
```

### 2.2 Data Persistence

#### 2.2.1 Save System
- Game state saved to browser's localStorage after each significant action
- Auto-save at regular intervals (every week in game time)
- Manual save/load functionality with multiple save slots
- Export/import save functionality via JSON

#### 2.2.2 Achievement Sharing
- Simple encryption/encoding of achievement data in URL parameters
- Format: `/achievement?key=[encoded_data]`
- Encoded data to include: player name, town name, achievement description, timestamp
- No server-side storage required

## 3. Core Gameplay Requirements

### 3.1 Game Loop

#### 3.1.0 Progressive Mechanics Revelation
For consistent player onboarding and retention:

```typescript
interface ProgressiveMechanics {
  currentComplexityTier: number;    // Current game complexity level
  unlockedMechanics: string[];      // Available game systems
  nextUnlock: {                     // Information about upcoming feature
    name: string;                   // Feature name
    description: string;            // Brief explanation
    unlockCondition: Condition;     // What triggers availability
    tutorialContent: string;        // How-to guidance
  };
  
  // Complexity tiers gate mechanics to avoid overwhelming players
  // Tier 1: Salary, basic production, first workers
  // Tier 2: First buildings, worker assignment
  // Tier 3: Building relationships, worker health
  // Tier 4: Economy and store systems
  // Tier 5: Society systems and full ethical choices
}
```

#### 3.1.1 Time System
- Week-based progression system
- Each week consists of 7 days that pass automatically at configurable speed
- Weekly "Salary Ceremony" as the central rhythm point
- Pause functionality to allow player decision-making
- Clear visual notification for weekly transitions with atmospheric elements (paper turning, ink spreading, etc.)

#### 3.1.2 Economy System
```typescript
interface Economy {
  // Core financial metrics
  treasury: number;                  // Current money available
  debt: number;                      // Outstanding loans
  interestRate: number;              // Current loan interest rate (increases with more debt)
  
  // Revenue streams
  mineRevenue: number;               // Income from mineral sales
  storeRevenue: number;              // Profit from company store markup
  taxRevenue: number;                // Income from property/business taxes (unlocked at Town scale)
  
  // Expense categories
  salaryExpenses: number;            // Total worker wages
  infrastructureMaintenance: number; // Upkeep costs for buildings
  loanPayments: number;              // Weekly debt servicing
  emergencyExpenses: number;         // Unexpected costs from events
  
  // Market factors
  mineralPrice: number;              // Current market price per unit
  priceFluctuation: number;          // Current market volatility
  demandLevel: number;               // Market demand affecting sales volume
  inflationRate: number;             // Gradual increase in costs over time
  
  // Economic tracking
  weeklyRevenueHistory: number[];    // Historical revenue tracking
  weeklyExpenseHistory: number[];    // Historical expense tracking
  profitMargin: number;              // Percentage profit on operations
  bankruptcyRisk: number;            // Risk assessment for financial collapse
}

// Revenue calculation
function calculateWeeklyRevenue(gameState) {
  return gameState.mineRevenue + gameState.storeRevenue + gameState.taxRevenue;
}

// Expense calculation
function calculateWeeklyExpenses(gameState) {
  return gameState.salaryExpenses + 
         gameState.infrastructureMaintenance + 
         gameState.loanPayments + 
         gameState.emergencyExpenses;
}

// Profit/loss calculation
function calculateWeeklyProfit(gameState) {
  return calculateWeeklyRevenue(gameState) - calculateWeeklyExpenses(gameState);
}

// Loan availability and interest calculation
function getAvailableLoan(gameState) {
  const baseAmount = gameState.townScale * 1000; // More loans available as town grows
  const riskMultiplier = Math.max(0.1, 1 - (gameState.bankruptcyRisk / 100));
  return baseAmount * riskMultiplier;
}

function calculateInterestRate(gameState) {
  const baseRate = 0.05; // 5% base interest
  const riskPremium = gameState.bankruptcyRisk / 100; // Higher risk = higher interest
  const debtPenalty = (gameState.debt / (gameState.treasury * 10 || 1)) * 0.02; // Penalty for high debt ratio
  return baseRate + riskPremium + debtPenalty;
}
```

#### 3.1.3 Worker System
```typescript
interface Worker {
  id: string;                   // Unique identifier
  name: string;                 // Procedurally generated name
  role: WorkerRole;             // Miner, builder, etc.
  health: number;               // 0-100 scale
  satisfaction: number;         // 0-100 scale
  productivity: number;         // Affected by health and satisfaction
  salary: number;               // Weekly pay
  journal: JournalEntry[];      // Personal story entries
  daysEmployed: number;         // Tenure tracking
  family: FamilyMember[];       // Connections for narrative events
  skills: WorkerSkill[];        // Specialized abilities
  backstory: string;            // Personal history (procedurally generated)
}

type WorkerRole = 'miner' | 'builder' | 'service' | 'management';

interface JournalEntry {
  week: number;                 // When entry was created
  text: string;                 // Journal entry content
  type: JournalEntryType;       // Categorization for filtering
  tone: EntryTone;              // Emotional quality of entry
}

type JournalEntryType = 'personal' | 'work' | 'town' | 'family';
type EntryTone = 'hopeful' | 'neutral' | 'concerned' | 'angry' | 'desperate';

// Workers should be initially limited to a manageable number (5-10)
// with clear visualization and personality to establish player connection
// before transitioning to more statistical management
```

#### 3.1.4 Building System
```typescript
interface Building {
  id: string;                   // Unique identifier
  type: BuildingType;           // Functional category
  level: number;                // Upgrade level
  condition: number;            // 0-100 scale
  workers: Worker[];            // Assigned workers
  position: Position;           // Location on map
  constructionProgress: number; // 0-100 for new buildings
  effects: BuildingEffect[];    // Impact on nearby buildings/workers
}

interface Position {
  x: number;
  y: number;
  rotation: number;
}

interface BuildingEffect {
  type: EffectType;             // Health, satisfaction, etc.
  radius: number;               // Effect range
  strength: number;             // Impact magnitude
  condition: EffectCondition;   // When effect applies
}
```

### 3.2 Progression Systems

#### 3.2.1 Town Scale Milestones
```typescript
enum TownScale {
  CAMP = 'Camp',                // 5-20 workers
  SETTLEMENT = 'Settlement',    // 21-50 workers
  VILLAGE = 'Village',          // 51-100 workers
  TOWN = 'Town',                // 101-250 workers
  CITY = 'City',                // 251-500 workers
  METROPOLIS = 'Metropolis',    // 501-1000 workers
  MEGAPOLIS = 'Megapolis'       // 1001+ workers
}

interface MilestoneUnlock {
  scale: TownScale;             // Required town scale
  unlocks: UnlockType[];        // Features unlocked
  narrative: string;            // Milestone description
  mechanicComplexity: number;   // 1-10 scale of system intricacy
  managementAbstraction: number; // 1-10 scale of distance from individuals
  visualEvolution: VisualStage; // Graphics enhancement at this milestone
}

// Milestone-specific unlocks by town scale
const townMilestones = [
  {
    scale: TownScale.CAMP,
    unlocks: ['basicProduction', 'workerHousing', 'manualLabor'],
    narrative: "A primitive mining camp has formed around your new acquisition. Workers live in crude shelters and work with basic tools. The operation is small enough that you know each laborer by name.",
    mechanicComplexity: 1,
    managementAbstraction: 1,
    visualEvolution: VisualStage.ROUGH_SKETCH
  },
  {
    scale: TownScale.SETTLEMENT,
    unlocks: ['improvedHousing', 'basicStore', 'workerSkills', 'healthSystem'],
    narrative: "Your camp has grown into a small settlement. Wooden structures replace tents, and a company store provides basic necessities. You begin to categorize workers rather than knowing each personally.",
    mechanicComplexity: 3,
    managementAbstraction: 3,
    visualEvolution: VisualStage.DETAILED_SKETCH
  },
  {
    scale: TownScale.VILLAGE,
    unlocks: ['education', 'healthcare', 'advancedMining', 'workerGroups'],
    narrative: "A proper village now surrounds your mine. Streets form between buildings, and social structures emerge. Your management reports now group workers into categories rather than listing individuals.",
    mechanicComplexity: 5,
    managementAbstraction: 5,
    visualEvolution: VisualStage.BLUEPRINT
  },
  {
    scale: TownScale.TOWN,
    unlocks: ['taxation', 'localGovernment', 'policingSystem', 'competingBusinesses'],
    narrative: "Your operation has grown into a substantial town. Administrative systems become necessary to manage the population. Workers are now primarily statistics in your ledgers, though occasional personal stories still reach your office.",
    mechanicComplexity: 7,
    managementAbstraction: 7,
    visualEvolution: VisualStage.INK_DRAWING
  },
  {
    scale: TownScale.CITY,
    unlocks: ['industrialUpgrades', 'socialClasses', 'politicalFactions', 'culturalInstitutions'],
    narrative: "A genuine industrial city has formed under your control. Class distinctions are pronounced, and your connection to individual workers has all but vanished. Systems and statistics dominate your decision-making.",
    mechanicComplexity: 8,
    managementAbstraction: 9,
    visualEvolution: VisualStage.PAINTED_ILLUSTRATION
  },
  {
    scale: TownScale.METROPOLIS,
    unlocks: ['financialMarkets', 'internationalTrade', 'advancedPolitics', 'culturalIdentity'],
    narrative: "Your industrial empire has spawned a metropolis. Workers are merely numbers on balance sheets, with rare exceptions during crises. Your decisions affect thousands of lives that you will never personally encounter.",
    mechanicComplexity: 9,
    managementAbstraction: 10,
    visualEvolution: VisualStage.DETAILED_ILLUSTRATION
  },
  {
    scale: TownScale.MEGAPOLIS,
    unlocks: ['corporateConglomerate', 'politicalPower', 'legacyPlanning', 'dynasticWealth'],
    narrative: "The vast urban sprawl you've created has transcended its origins as a mining town. Your enterprise has become a societal force unto itself, with implications for the entire nation. The human element of your business has been entirely abstracted away.",
    mechanicComplexity: 10,
    managementAbstraction: 10,
    visualEvolution: VisualStage.ORNATE_ILLUSTRATION
  }
]
```

#### 3.2.2 Meta-progression System
```typescript
interface MetaProgression {
  currency: number;             // "Reincarnation points"
  unlockedUpgrades: Upgrade[];  // Purchased permanent benefits
  completedAchievements: Achievement[]; // Tracked accomplishments
}

interface Upgrade {
  id: string;                   // Unique identifier
  name: string;                 // Display name
  description: string;          // Effect description
  cost: number;                 // Currency cost
  type: UpgradeType;            // Cosmetic, balance, or automation
  effect: UpgradeEffect;        // Implementation details
}
```

### 3.3 Event System

#### 3.3.1 Event Generation
```typescript
interface Event {
  id: string;                   // Unique identifier
  title: string;                // Display title
  description: string;          // Detailed description
  options: EventOption[];       // Player choices
  trigger: EventTrigger;        // When event occurs
  frequency: EventFrequency;    // How often it can happen
  prerequisites: EventPrerequisite[]; // Required conditions
}

interface EventOption {
  text: string;                 // Display text
  effects: EventEffect[];       // Consequences
  requirements?: Requirement[]; // Conditions to be available
}

interface EventTrigger {
  type: TriggerType;            // When checked
  conditions: Condition[];      // What must be true
}
```

#### 3.3.2 Reality Check Events
Special events that force player to confront consequences of policies, becoming more impactful/rare as town grows:

```typescript
interface RealityCheckEvent extends Event {
  workerFocus: string;          // Specific worker affected
  policyHighlight: PolicyType;  // Which policy is scrutinized
  severityScale: number;        // Impact intensity (1-10)
}
```

### 3.4 UI Requirements

#### 3.4.0 First-Time Experience
- Narrative introduction with period-appropriate language
- Character introduction (player's secretary/assistant)
- Limited initial UI showing only the mine and salary slider
- Contextual highlighting for interactive elements
- Progressive revelation of UI elements as mechanics unlock
- Tutorial tooltips that appear only when relevant

#### 3.4.1 Core Interface Elements
- Header with key metrics (Treasury, Population, Satisfaction, Production)
- Contextual information panel for selected buildings/workers
- Weekly salary ceremony modal with animated statistics and atmospheric elements
- Detailed statistics panel with tabbed categories (unlocks gradually)
- Journal/lore collection interface
- Main view controls (zoom, pan, speed)
- Consistent period-appropriate terminology throughout UI
- Notification system with different urgency levels (styled as notes, telegrams, etc.)

#### 3.4.2 Map Visualization
- Procedurally generated town layout with non-grid streets
- Mine as central focal point
- Buildings placed automatically with "reposition" option
- Visual evolution from simple sketches to detailed illustrations
- Zoom levels with different management focuses (micro to macro)
- Visual language that reinforces the power dynamics (workers as small elements, player's office as dominant viewpoint)
- Map details that reflect town status (smoke from productive mines, crowds near low-wage areas)
- Atmospheric elements based on town conditions (more dirt/grime with poor conditions)

#### 3.4.3 Visual Style Requirements
- Sepia-toned paper aesthetic with texture overlays
- Coffee stains and soot marks for atmosphere
- Industrial Revolution visual motifs
- "Built with sweat and tears" visual theme
- Evolution from rough sketches to detailed illustrations as town grows
- Period-appropriate typography and iconography

## 4. Game Systems Specification

### 4.1 Salary Mechanism
The core interactive element that impacts multiple systems:

```typescript
interface SalaryMechanism {
  baseSalary: number;           // Current setting (10-100)
  rivalSalaries: number[];      // Nearby town offerings
  marketAverage: number;        // Region average
  workerExpectation: number;    // Based on conditions
  minSalary: number;            // Minimum possible wage (10$)
  maxSalary: number;            // Maximum effective wage (100$)
  migrationFactor: number;      // Workers attracted per day (50)
  
  // Key formulas
  calculateMigration(): number; // New workers attracted
  calculateSatisfaction(): number; // Worker happiness
  calculateCost(): number;      // Total salary expense
  calculateProductivity(): number; // Work efficiency
  
  // Worker perception factors
  salaryChangePerception: {
    increase: {
      small: number;            // Satisfaction bonus for small raises
      medium: number;           // Satisfaction bonus for medium raises
      large: number;            // Satisfaction bonus for large raises
    },
    decrease: {
      small: number;            // Satisfaction penalty for small cuts
      medium: number;           // Satisfaction penalty for medium cuts
      large: number;            // Satisfaction penalty for large cuts
    },
    memory: number;             // How long workers remember changes
  };
  
  // Class distinctions
  salaryTiers: {
    subsistence: [number, number]; // Barely surviving wage range
    working: [number, number];     // Average working wage range
    skilled: [number, number];     // Specialized worker wage range
    management: [number, number];  // Overseer wage range
  };
  
  // Social consequences
  societalImpacts: {
    inequality: number;         // Measure of wage disparity
    socialMobility: number;     // Possibility of advancement
    classConflict: number;      // Tension between worker groups
  };
}
```

Formulas (exact implementation):
```typescript
// Migration formula - determines new workers attracted
Migration = (Salary - Salaire_min) / (Salaire_max - Salaire_min) * Facteur_migration
// Where:
// - Salaire_min = 10$ (minimum wage)
// - Salaire_max = 100$ (maximum effective wage)
// - Facteur_migration = 50 miners per day

// Satisfaction formula - determines worker happiness
Satisfaction = (Salary / Salaire_moyen) * (1 + Bonus_infrastructures)
// Where:
// - Salaire_moyen is the average salary in the region
// - Bonus_infrastructures is derived from town facilities

// Salary perception adjustments
// - Raises are remembered positively for 4 weeks
// - Cuts are remembered negatively for 8 weeks
// - Cuts create 2x the emotional impact of equivalent raises
// - Consecutive changes in the same direction have diminishing returns

// Salary history affects worker loyalty
// - Stable or increasing wages build loyalty (reduces quitting chance)
// - Volatile or decreasing wages destroy loyalty (increases quitting chance)
// - Workers compare their history against others (perceived fairness)

// Productivity calculation with expanded factors
Productivity = BaseProductivity * (0.5 + (Health * 0.25) + (Satisfaction * 0.25)) *
               (1 + (Skill * 0.1)) * (1 + (Tools * 0.15)) * 
               (1 - (Fatigue * 0.2)) * (DayOfWeek === 'Monday' ? 0.9 : 1) *
               (DayOfWeek === 'Friday' ? 0.95 : 1)

// Clear visualization requirements:
// - Large, prominent salary slider as first interactive element
// - Real-time feedback showing projected effects on migration and satisfaction
// - Historical salary trend visualization after multiple weeks
// - Comparative context with competitors' wages (when that system unlocks)
// - Visual indication of each worker's class tier based on wages
```

### 4.2 Town Layer Systems
Each system adds complexity gradually as town grows:

#### 4.2.1 Mine Layer (Production)
```typescript
interface MineSystem {
  extractionRate: number;       // Raw materials per worker
  refinementEfficiency: number; // Processing effectiveness
  marketDemand: number;         // Current buyer interest
  resources: Resource[];        // Available material types
  equipment: Equipment[];       // Mining tools/machines
  depth: number;                // Current mining level
  hazards: MineHazard[];        // Potential dangers
  baseProductivity: number;     // Base production per worker
  basePrice: number;            // Base price per ton (50$)
  priceFluctuation: number;     // Market fluctuation range (±20%)
}
```

Production and cost formulas (exact implementation):
```typescript
// Production formula
Production = Nombre_mineurs * Productivité_mineur
// Where:
// - Nombre_mineurs is the total number of workers assigned to mining
// - Productivité_mineur is the individual productivity affected by health, satisfaction, and infrastructure

// Operational cost formula
Coût = (Nombre_mineurs * Salaire) + Coût_infrastructures
// Where:
// - Nombre_mineurs is the total number of workers
// - Salaire is the current wage per worker
// - Coût_infrastructures is the maintenance cost of all facilities

// Mineral price calculation
Prix_minerai = Prix_base * (1 + Fluctuation_marché)
// Where:
// - Prix_base = 50$ per ton
// - Fluctuation_marché ranges from -20% to +20% based on market conditions
```

#### 4.2.2 Store Layer (Economy)
```typescript
interface StoreSystem {
  inventory: InventoryItem[];   // Stock of goods
  prices: ItemPrice[];          // Retail markups
  supplierCosts: ItemPrice[];   // Wholesale costs
  demand: ItemDemand[];         // Worker needs
  shortages: ItemShortage[];    // Missing necessities
  competitorPrices: ItemPrice[]; // Other stores' rates
  eventInfluence: number;       // Impact of global events on prices
}
```

#### 4.2.3 People Layer (Society)
```typescript
interface SocietySystem {
  education: EducationStats;    // Schools and literacy
  healthcare: HealthcareStats;  // Hospitals and wellness
  policing: SecurityStats;      // Order maintenance
  leisure: LeisureStats;        // Entertainment options
  housing: HousingStats;        // Living conditions
  unrest: number;               // Risk of rebellion
  rumors: Rumor[];              // Spreading information
  strikeRisk: number;           // Chance of work stoppage
  townAttractiveness: number;   // Appeal to potential migrants
  housingAvailability: number;  // Available living space percentage
}
```

Population and strike mechanics:
```typescript
// Migration formula including town factors
Nouveaux_arrivants = Migration * Attractivité_ville * Disponibilité_logement
// Where:
// - Migration is calculated from the salary formula
// - Attractivité_ville is derived from infrastructure quality and town reputation
// - Disponibilité_logement represents available housing ratio

// Strike risk calculation
// A strike becomes possible when worker satisfaction falls below 50%
// Risk increases based on how far below 50% satisfaction falls
StrikeRisk = satisfaction < 50 ? ((50 - satisfaction) / 50) * 100 : 0
```

### 4.3 Ethical Challenge System
Implementation of the "punishing centrism" philosophy:

```typescript
interface EthicalChoice {
  id: string;                   // Unique identifier
  name: string;                 // Policy name
  description: string;          // What it entails
  options: EthicalOption[];     // Possible settings
  currentOption: number;        // Selected policy level
  visibleEffects: Effect[];     // Immediate consequences
  hiddenEffects: Effect[];      // Long-term impacts
  extremismScore: number;       // How far from center (-10 to 10)
}

interface EthicalOption {
  value: number;                // Setting value
  label: string;                // Display name
  description: string;          // Detailed explanation
  immediateBenefit: number;     // Short-term advantage
  longTermRisk: number;         // Future danger
}
```

### 4.4 Infrastructure System
Management of town facilities that affect worker satisfaction and productivity:

```typescript
interface Infrastructure {
  type: InfrastructureType;     // Category of building
  level: number;                // Upgrade level
  cost: number;                 // Construction cost
  maintenanceCost: number;      // Weekly upkeep expense
  capacityUsed: number;         // Current utilization
  capacityTotal: number;        // Maximum capacity
  satisfactionBonus: number;    // Impact on worker happiness
  productivityBonus: number;    // Impact on worker efficiency
  healthBonus: number;          // Impact on worker health
  visualState: BuildingVisualState; // Current appearance
  unlockRequirements: UnlockRequirement[]; // When available
}

enum InfrastructureType {
  HOUSING = 'Housing',          // Basic shelter (500$)
  EDUCATION = 'Education',      // Schools (1000$)
  HEALTHCARE = 'Healthcare',    // Hospitals (2000$)
  LEISURE = 'Leisure'           // Recreation (800$)
}

enum BuildingVisualState {
  PLANNED,                      // Just marked for construction
  CONSTRUCTION,                 // Being built
  BASIC,                        // Level 1 appearance
  IMPROVED,                     // Level 2 appearance
  ADVANCED,                     // Level 3 appearance
  DAMAGED,                      // Needs repair
  ABANDONED                     // No longer in use
}
```

Infrastructure bonus calculation:
```typescript
// Each complete infrastructure provides a 10% productivity bonus
ProductivityBonus = 0.1 * NumberOfCompleteInfrastructures

// Infrastructure affects satisfaction based on its quality and capacity
SatisfactionBonus = Σ(Infrastructure.level * Infrastructure.capacityUsed / Infrastructure.capacityTotal)

// Building relationships:
// - Buildings have defined compatibility values with other buildings
// - Sleep near Work: -10% satisfaction but +5% productivity
// - Leisure near Housing: +15% satisfaction
// - Education near Housing: +10% satisfaction, +5% productivity
// - Healthcare near Industrial: +5% health, +10% recovery rate
```

### 4.5 System Integration Model

To ensure coherent interactions between game systems, key points of integration:

```typescript
interface SystemIntegrationPoints {
  // Salary impacts multiple systems
  salary: {
    affectsMigration: true,     // Higher salaries attract workers
    affectsSatisfaction: true,  // Higher salaries increase satisfaction
    affectsProductivity: true,  // Via satisfaction
    affectsTreasury: true,      // Direct expense
    affectsSocialStatus: true,  // Relative to other towns' wages
  },
  
  // Infrastructure creates interconnections
  infrastructure: {
    affectsSatisfaction: true,  // Better facilities improve happiness
    affectsProductivity: true,  // Better facilities improve efficiency
    affectsHealth: true,        // Better facilities improve wellbeing
    affectsMigration: true,     // Better town attracts workers
    affectsTreasury: true,      // Construction and maintenance costs
    affectsEnvironment: true,   // Pollution/cleanliness of town
  },
  
  // Health creates dynamic challenges
  health: {
    affectsProductivity: true,  // Healthier workers produce more
    affectedByInfrastructure: true, // Better facilities improve health
    triggersEvents: true,       // Illness can cause narrative events
    causesExpenses: true,       // Medical costs when sick
    affectsMortality: true,     // Death rates impact town reputation
    affectsWorkforce: true,     // Available workers reduced by illness
  },
  
  // Social dynamics emerge from work conditions
  society: {
    affectsStability: true,     // Social cohesion prevents unrest
    affectedBySalary: true,     // Pay disparity increases tension
    affectedByHealth: true,     // Suffering breeds discontent
    triggersCommunityEvents: true, // Social gatherings, religious events
    emergentUnionization: true, // Workers organize with low satisfaction
    createsPowerDynamics: true, // Class structures form in larger towns
  },
  
  // Make sure each system has at least 3 meaningful connections
  // to other systems for integrated gameplay experience
}
```

### 4.6 Worker Lifecycle System

To implement the transition from individual care to statistical management:

```typescript
interface WorkerLifecycle {
  recruitment: {
    sourcingMethods: string[];   // How workers arrive (migration, birth, etc.)
    onboardingProcess: string;   // First assignment process
    initialImpression: number;   // Starting satisfaction modifier
  },
  
  development: {
    skillProgression: boolean;   // Can improve over time
    loyaltyBuilding: boolean;    // Tenure-based satisfaction bonus
    familyFormation: boolean;    // Can establish connections to other workers
    educationEffects: boolean;   // Learning improves productivity
  },
  
  health: {
    baseHealthDecline: number;   // Natural health loss rate from work
    accidentRisk: number;        // Chance of workplace incidents
    chronicConditions: string[]; // Long-term health issues that can develop
    recoveryFactors: string[];   // What improves health
    mortalityRisk: number;       // Death probability calculation
  },
  
  departure: {
    voluntaryLeaving: {          // Worker chooses to leave
      satisfactionThreshold: number; // Below this, risk of quitting
      competitorSalaryFactor: number; // Impact of better offers elsewhere
      familyTieStrength: number; // Family connections reduce leaving chance
    },
    
    firing: {                    // Player dismisses worker
      compensationRequired: boolean; // Severance pay needed?
      moralePenalty: number;     // Impact on remaining workers
      reputationImpact: number;  // How it affects town reputation
    },
    
    death: {                     // Worker dies
      familyCompensation: boolean; // Support for dependents
      memorialEffect: boolean;   // Commemoration improves town spirit
      replacementDelay: number;  // Time before position can be filled
    }
  },
  
  abstractionTransition: {
    individualDetailThreshold: number;  // Population where workers become statistics
    groupingCategories: string[];       // How workers are categorized in late game
    exceptionalIndividualRules: any;    // When specific workers remain highlighted
    narrativeEventTriggers: any;        // What pulls individual stories into focus
  }
}
```

### 4.7 Narrative Voice System

To implement the period-appropriate tone and emphasize the theme:

```typescript
interface NarrativeVoice {
  playerPerspective: {
    roleTitle: string;           // "Mine Proprietor", "Industrial Magnate", etc.
    formalAddress: string;       // How the game addresses the player
    decisionFraming: string;     // How choices are presented
    moralityFraming: string;     // How ethical decisions are framed
    periodAssumptions: string[]; // Historical attitudes taken for granted
  },
  
  workerVoices: {
    initialPersonalization: boolean; // Individual voices early game
    classIdentity: string;           // How workers refer to themselves
    evolutionWithScale: any;         // How worker voice changes as town grows
    collectiveConsciousness: any;    // Union/group voice emergence
  },
  
  gameObserver: {
    neutrality: boolean;         // Does narration take sides?
    historicalIrony: boolean;    // Commentary on period practices
    foreshadowing: boolean;      // Hints at consequences
    reportingStyle: string;      // "Newspaper", "Ledger", "Journal" etc.
  },
  
  languageEvolution: {
    earlyGameTone: string;       // Personal, direct, individual-focused
    midGameTone: string;         // Business-like, efficiency-oriented
    lateGameTone: string;        // Abstract, systems-focused, dehumanized
    narrativeDissonanceMoments: string[]; // When personal stories break through
  }
}
```

### 4.6 Narrative Integration

To create a coherent atmospheric experience:

```typescript
interface NarrativeElements {
  // Period-appropriate language throughout
  languageStyle: {
    formality: 'high',           // Formal, business-like communication
    periodSpecific: true,        // 19th century industrial terminology
    characterVoices: {           // Different character types speak differently
      secretary: 'deferential',
      worker: 'humble',
      competitor: 'pompous'
    }
  },
  
  // Visual storytelling elements
  visualNarrative: {
    documentStyle: 'period',     // Papers, ledgers, blueprints
    annotations: true,           // Handwritten notes on documents
    weathering: true,            // Coffee stains, soot marks, tears
    visualEvolution: {           // How aesthetics change with progression
      early: 'rough sketches',
      mid: 'detailed drawings',
      late: 'ornate illustrations'
    }
  },
  
  // Sound design concepts
  soundDesign: {
    ambience: 'industrial',      // Background sounds based on town activity
    interactions: 'mechanical',  // Button/slider sounds (paper, mechanical)
    milestones: 'ceremonial',    // Special audio for achievements/milestones
    tempo: 'matches game speed'  // Audio pacing tied to game time
  }
}
```

## 5. Feature Implementation Priorities

### 5.1 Phase 1: Core Experience (MVP)
1. Basic town map with mine and procedural building placement
2. Weekly wage setting mechanic with worker migration
3. Simple production and economic system
4. Initial aesthetic implementation with paper styling
5. Save/load functionality
6. Tutorial introduction

### 5.2 Phase 2: Depth and Engagement
1. Worker journal system with procedural narratives
2. Building compatibility effects
3. Reality check events
4. Expanded town evolution with visual progression
5. Basic ethical choice system

### 5.3 Phase 3: Systems Complexity
1. Full layered systems (Mine, Store, People)
2. Advanced town scaling with milestone unlocks
3. Meta-progression with permanent upgrades
4. Achievement system with sharing functionality
5. Enhanced visual and audio presentation

## 6. Achievement System

### 6.1 In-Game Achievements
```typescript
interface Achievement {
  id: string;                   // Unique identifier
  name: string;                 // Display name
  description: string;          // Accomplishment details
  icon: string;                 // Visual representation
  category: AchievementCategory; // Grouping type
  isSecret: boolean;            // Hidden until unlocked
  condition: AchievementCondition; // Unlock requirements
  reward: number;               // Meta-currency granted
}

type AchievementCategory = 
  'population' | 'economy' | 'buildings' | 'events' | 'ethics' | 'milestones';
```

### 6.2 Shareable Achievements
```typescript
interface ShareableAchievement {
  achievementId: string;        // Reference to base achievement
  playerName: string;           // Player identifier
  townName: string;             // Town name
  dateEarned: number;           // Unix timestamp
  townStats: TownSummary;       // Key metrics at time of earning
}

interface TownSummary {
  population: number;
  scale: TownScale;
  treasury: number;
  buildingCount: number;
  weeksSurvived: number;
  ethicalAlignment: number;     // -100 to 100 scale
}
```

#### 6.2.1 Achievement Sharing Implementation
- Encoding: Base64 encoding of JSON data with simple XOR encryption
- URL format: `/achievements?key=[encoded_data]`
- Decode on achievement page load to display personalized message
- Share buttons for Twitter, Facebook, and direct link copying