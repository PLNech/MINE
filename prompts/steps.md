# Step 1


I need you to set up the foundation for an incremental management simulation game called "This Town Is Mine" where players assume the role of a 19th-century capitalist managing a company town around a mine.
Please help me implement the following:

Create the basic project structure by:

Setting up a proper file structure for a Next.js game with TypeScript and Tailwind CSS
Creating necessary game state management using React Context API
Setting up a localStorage-based save system


Implement the core visual design:

Create a sepia-toned, paper-like interface with textures
Add coffee stains and soot marks for atmosphere
Set up proper typography with period-appropriate styling
Create a basic responsive layout that works on desktop and adapts to tablet/mobile


Implement the initial game state and types:

Define TypeScript interfaces for core game elements (Worker, Building, Economy)
Set up the initial game state with proper typing
Create constants for game parameters
Implement a basic weekly time system


Create the landing page:

Implement a simple intro page with period-appropriate styling
Add a "Start Game" button that leads to the main game view



The implementation should follow these technical requirements:

Use Next.js with App Router for routing
Use TypeScript for type safety
Use Tailwind CSS for styling
Use React Context API for state management
Save game state to localStorage

Please don't implement any game mechanics yet - just the foundation, styling, and state management structure. Focus on getting the visual aesthetic right (sepia-toned paper look) and setting up a proper foundation for future development.


# Step 2



Let's focus on implementing the fundamental game mechanics and state management systems without UI enhancements or tutorials yet.
Please implement:

Enhance the game state and reducer:

Expand the game state to include:

Current salary setting
Worker satisfaction calculation
Production metrics
Weekly financial tracking


Implement reducer actions for:

Setting salary
Hiring workers
Calculating production
Updating treasury
Advancing time




Implement the core economic calculations:

Worker migration based on salary using the formula: Migration = (Salary - 10) / (100 - 10) * 50
Production calculation based on number of workers and their productivity
Revenue generation based on production and mineral price
Expense calculation based on salaries and maintenance costs
Treasury updates that track weekly profit/loss


Implement the weekly cycle logic:

Automatic worker migration based on salary attractiveness
Production calculations for each worker
Financial updates based on production and expenses
Basic town scale progression based on worker count


Create a simple hierarchical text representation of game state:

Display current buildings (starting with just the mine)
Show worker count and allocation
Display basic financial information
No need for a graphical map yet



Technical requirements:

Focus on the JavaScript/TypeScript logic rather than UI design
Ensure all formulas match the specifications in the PRD
Update the save/load system to handle the expanded state
Add proper type definitions for all new state elements
Implement unit tests for core economic calculations

This step should establish the foundational game mechanics that will drive the simulation, focusing on functionality rather than presentation.


