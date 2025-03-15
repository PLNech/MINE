# This Town Is Mine - Game Design Document

*An incremental management game with robber baron aesthetics where the consequences of controlling an entire town come to light*

## Concept Overview
An incremental management simulation where the player assumes the role of a 19th-century capitalist establishing and developing a company town around a newly acquired mine. The game features robber baron aesthetics with a sepia-toned, paper-like interface that evolves in detail and complexity as the town grows.

## Core Gameplay

### Progression Stages
1. **Initial Experience**
   - A. Narrative introduction via a personal agent/secretary (period-appropriate terminology)
   - B. Introduction to the mine and simple map
   - C. First interaction: Setting worker wages via a prominent slider
      - I. Tutorial guides player to set a good initial salary
      - II. This attracts the first 5 workers to the mine
   - D. Tutorial-guided process to attract initial workers and establish basic infrastructure
   - E. Building the first barracks by allocating workers to construction
      - I. Player assigns 1 of 5 workers as a Builder
      - II. First building created is the Barracks for worker housing

2. **Gameplay Mechanics**
   - A. Primary mechanic: Weekly wage setting
      - I. Weekly "Salary Ceremony" with animated stats modal
      - II. Balance between attracting workers and maintaining profit
   - B. Secondary mechanics (unlocked progressively)
      - I. Building operation strategies (similar to Frostpunk)
      - II. Town infrastructure development
      - III. Worker allocation across different functions
      - IV. Advanced interactions (competition, collusion) in later gameplay

3. **Difficulty Scaling**
   - A. Competition from neighboring towns
   - B. Worker illness from poor conditions
   - C. Morale issues causing random events
   - D. Risk of uprisings with extreme exploitation
   - E. Complexity increases as new systems unlock

4. **Milestone System**
   - A. Based on town scale progression
      - I. Tiny village
      - II. Settlement
      - III. Town
      - IV. City
      - V. Metropolis
      - VI. Megapolis
   - B. Each milestone unlocks new mechanics and challenges

5. **Victory Conditions**
   - A. Designed as an infinite game
   - B. Lore text collection via journal entries
   - C. Achievements for different play styles and milestones
   - D. Complete all unlocks and achievements for 100% completion

## Visual & Map Design

1. **Aesthetic**
   - A. Sepia-toned paper aesthetic
   - B. Coffee stains and soot marks for atmosphere
   - C. Evolution from simple sketches to detailed illustrations
   - D. Industrial Revolution visual themes
   - E. "Built with sweat and tears" visual motif
   - F. Paper-like textures and historical document styling

2. **Map Evolution**
   - A. Procedurally generated, non-grid layout
      - I. Natural, organic street development
      - II. Mine as the central point of town
      - III. Avoiding square town layouts in favor of natural sprawl
      - IV. Crooks and nooks that evolve organically from the mine center
   - B. Building placement
      - I. Automatic placement with "Reposition Near [building]" option
      - II. Building compatibility factors (sleep near work = bad for sleep, eat near work = bad for morale)
      - III. No direct placement choices by player, focus on relationships
   - C. Visual growth representation
      - I. Initial view: Mine and small camp
      - II. Progressive dezoom as town expands
      - III. Gradual increase in complexity and density
      - IV. Scale change requires different zoom levels for management
         - a. Zoom in to see and care about individuals
         - b. Zoom out to manage town as a whole
         - c. Late-game perspective shift where mine becomes tiny relative to sprawl

## UI/UX Elements

1. **Interface Components**
   - A. Header with key metrics and resources
   - B. Contextual panel showing information for selected elements
   - C. Weekly salary ceremony modal
      - I. Dramatic animated presentation of stats
      - II. Weekly performance metrics and town status
      - III. Key events from the week
   - D. Detailed statistics view with multiple tabs
      - I. Multiple tabs for different aspects of town management
      - II. In-depth data for players who want to optimize
      - III. Historical trends and projections
   - E. Journal/lore collection interface
      - I. Worker journals with first-person entries
      - II. Town history and milestone achievements
      - III. Unlockable lore texts based on specific conditions

2. **Feedback Systems**
   - A. Immediate feedback for some decisions
   - B. Medium-term consequences developing over weeks
   - C. Long-term effects that accumulate subtly

3. **Time Progression**
   - A. Week-based cycle
      - I. Weekly as the primary game rhythm
      - II. Fits thematically with weekly wage payments
   - B. Weekly wage payments as a central rhythm
      - I. Dramatic "salary ceremony" animation
      - II. Stats modal showing performance
      - III. Key event notifications
   - C. Events can trigger between or during weekly cycles
      - I. Immediate consequences for some decisions
      - II. Medium-term effects developing over weeks
      - III. Long-term consequences accumulating subtly

## Engagement Mechanics

1. **Core Loop Design**
   - A. Active gameplay session (~1 hour per run)
   - B. Inevitable failure with performance summary
      - I. Game always ends in failure eventually
      - II. Summary screen shows consequences of player's actions
      - III. Encourages learning from mistakes for future playthroughs
   - C. Focus on active management rather than idle gameplay
      - I. More like Frostpunk than Trimps
      - II. Constant decision-making and adjustments
      - III. Some mechanics develop over time, but minimal idle waiting
   - D. Frostpunk-inspired active decision making

2. **Player Agency vs. Simulation**
   - A. Transition from micro to macro management
      - I. Early game: Individual worker management ("Pet" phase)
         - a. Workers have names and personal stories
         - b. Player develops attachment to individual workers
      - II. Mid-late game: Policy-level decisions ("Cattle" phase)
         - a. Transition from individual care to systemic management
         - b. Impossible to track all workers as town grows
   - B. Micromanagement events throughout gameplay
      - I. Personal worker situations (illness, requests, etc.)
         - a. Example: "Robert's kid got sick again. They asked for a salary advance for medicine."
      - II. These become "reality checks" in late game
         - a. Rare events that cut through layers of management
         - b. Force player to confront consequences of policies
         - c. Realization moments: "Have my policies caused this?"
   - C. Emergent gameplay from system interactions
      - I. Complex interactions between systems
      - II. Surprising but not chaotic outcomes
      - III. Sufficient predictability for strategic planning
         - a. Investments should have predictable returns
         - b. Emergent elements add flavor without feeling random

## Challenge Balance

1. **Layered Systems**
   - A. **Mine Layer** (Production)
      - I. Mineral extraction
      - II. Refinement processes
      - III. Global market sales
   - B. **Store Layer** (Economy)
      - I. Wholesale purchasing
      - II. Retail to workers
      - III. Stock management
      - IV. Shortage handling
   - C. **People Layer** (Society)
      - I. Education systems
      - II. Law enforcement
      - III. Emergency services
      - IV. Social unrest management
      - V. Urban legends and social dynamics

2. **Risk vs. Reward**
   - A. Punishing centrism design philosophy
      - I. Ultra-aggressive capitalism path
      - II. Socialist utopia under benevolent dictator path
      - III. Both extremes more viable than middle ground
      - IV. All approaches eventually fail, but extremes last longer
   - B. Ethical shortcuts as core gameplay element
      - I. Short-term gains with hidden long-term costs
      - II. Moral decisions with mechanical consequences
      - III. Tempting choices that destabilize the system in non-obvious ways

## Memorable Moments

1. **Narrative Events**
   - A. Procedurally generated situations
      - I. Based on first principles of worker metrics
      - II. Triggered by health, satisfaction, and other worker attributes (3-5 metrics)
      - III. Mix of immediate effects and long-term consequences
      - IV. Some events develop slowly ("oh wow this was actually building up for months")
   - B. No "boss battle" style challenges
   - C. Period-appropriate events tied to industrial revolution themes

2. **Character Development**
   - A. Worker journal system
      - I. First-person entries documenting key life events
      - II. Revealed gradually through gameplay events
   - B. Notable characters
      - I. Semi-scripted appearances (competitors, union leaders)
      - II. Procedurally generated personalities and situations

## Meta Progression

1. **Unlock System**
   - A. Post-failure currency rewards
      - I. Based on final state of city when it fails
      - II. Reincarnation-themed naming concept
   - B. Permanent unlocks
      - I. Cosmetic map variations
      - II. Balance-affecting advantages
         - a. Changes to core balance factors
         - b. Makes certain mechanics easier to manage
      - III. Automation systems for complex mechanics
         - a. Automates previously manual balance activities
         - b. Allows players to reach further stages before failure
         - c. More expensive upgrades for more significant automation

## Political/Social Commentary

1. **Historical Authenticity**
   - A. Strictly historical inspiration
   - B. No fictional or fantastical elements
   - C. Authentic to potential real-world factory town experiences