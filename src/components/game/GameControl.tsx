'use client';

import { useGame } from '@/lib/context/GameContext';
import { GameSpeed, NotificationType } from '@/lib/types/game';
import { GAME_PARAMETERS, TUTORIAL_FLOW } from '@/lib/constants/gameConstants';
import { useState, useEffect, useMemo } from 'react';
import { TutorialStage } from '@/lib/types/game';

interface GameControlProps {
  onResetTutorial: () => void;
}

export default function GameControl({ onResetTutorial }: GameControlProps) {
  const { state, dispatch } = useGame();
  const [salaryCeremonyOpen, setSalaryCeremonyOpen] = useState(false);

  // Debug render
  console.log("GameControl rendering with salary:", state.salary);

  // Debug salary changes
  useEffect(() => {
    console.log("Salary changed in GameControl:", state.salary);
  }, [state.salary]);

  // Calculate projected worker migration based on salary
  const projectedMigration = Math.round(((state.salary - GAME_PARAMETERS.MIN_WAGE) / 
    (GAME_PARAMETERS.MAX_WAGE - GAME_PARAMETERS.MIN_WAGE)) * 50);
  
  // Calculate weekly expenses
  const weeklyExpenses = state.workers.length * state.salary;

  // Handle salary change with debug
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSalary = Math.max(
      GAME_PARAMETERS.MIN_WAGE,
      Math.min(parseInt(e.target.value) || GAME_PARAMETERS.MIN_WAGE, GAME_PARAMETERS.MAX_WAGE)
    );
    
    console.log("About to dispatch salary change:", newSalary);
    
    try {
      dispatch({ type: 'SET_SALARY', payload: newSalary });
      console.log("Dispatch completed");
    } catch (error) {
      console.error("Error dispatching salary change:", error);
    }

    // Track tutorial progress in a separate dispatch
    if (!state.tutorial.conditions.hasAdjustedSalary) {
      dispatch({ 
        type: 'UPDATE_TUTORIAL_CONDITION', 
        payload: { condition: 'hasAdjustedSalary', value: true } 
      });
    }
  };

  // Get salary color based on value
  const getSalaryColor = () => {
    if (state.salary < 20) return 'text-red-800';
    if (state.salary > 60) return 'text-green-800';
    return 'text-amber-700';
  };

  // Check if controls should be interactive based on tutorial stage
  const canInteract = (stage: TutorialStage) => {
    return true; //FIXME: canInteract was buggy, keeping all visible for now
    // Allow interaction if tutorial is completed or we're at/past this stage
    // const stageIndex = Object.values(TutorialStage).indexOf(stage);
    // const currentStageIndex = Object.values(TutorialStage).indexOf(state.tutorial.stage);
    // console.log("Could interact? stage=", stage, "current tutorial:", state.tutorial)
    // return state.tutorial.completed || currentStageIndex >= stageIndex;
  };
  
  return (
    <div className="p-6 font-old-standard">
      {/* Always visible controls, but conditionally interactive */}
      <div className="space-y-6">
        {/* Salary Control */}
        <div className={`p-4 bg-amber-100 border-2 border-amber-700 rounded shadow-md
          ${!canInteract(TutorialStage.SALARY_SETTING) ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <h3 className="font-im-fell text-xl text-gray-800 mb-3">Weekly Salary</h3>
          <div className="flex items-center space-x-4">
            <span className={`text-xl font-bold ${getSalaryColor()}`}>${state.salary}</span>
            <input
              type="range"
              min={GAME_PARAMETERS.MIN_WAGE}
              max={GAME_PARAMETERS.MAX_WAGE}
              value={state.salary}
              onChange={handleSalaryChange}
              className="flex-grow h-3 appearance-none rounded-full bg-amber-300 outline-none"
              data-testid="salary-slider"
            />
          </div>
          <div className="mt-3 text-sm text-gray-700">
            <p>Projected worker migration: <span className="font-bold">{projectedMigration} workers/week</span></p>
          </div>
        </div>

        {/* Stats */}
        <div className={`space-y-4 ${!canInteract(TutorialStage.WORKER_MANAGEMENT) ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="stat-group">
            <h3 className="font-im-fell text-lg text-gray-800">Expenses</h3>
            <p className="text-xl text-rose-700">${weeklyExpenses}</p>
          </div>

          <div className="stat-group">
            <h3 className="font-im-fell text-lg text-gray-800">Workers</h3>
            <p className="text-xl">{state.workers.length}</p>
          </div>

          <div className="stat-group">
            <h3 className="font-im-fell text-lg text-gray-800">Town Scale</h3>
            <p className="text-xl">{state.townScale}</p>
          </div>
          
          <div className="stat-group">
            <h3 className="font-im-fell text-lg text-gray-800">Mineral Price</h3>
            <p className="text-xl">${state.economy.mineralPrice}/unit</p>
          </div>

          {/* Game Speed Controls */}
          <div className="mb-8">
            <h3 className="font-im-fell text-lg text-gray-800 mb-2">Game Speed</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSpeedChange(GameSpeed.PAUSED)}
                className={`px-3 py-1 rounded border ${
                  state.gameSpeed === GameSpeed.PAUSED
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-100 border-amber-700'
                }`}
              >
                Paused
              </button>
              <button
                onClick={() => handleSpeedChange(GameSpeed.NORMAL)}
                className={`px-3 py-1 rounded border ${
                  state.gameSpeed === GameSpeed.NORMAL
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-100 border-amber-700'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => handleSpeedChange(GameSpeed.FAST)}
                className={`px-3 py-1 rounded border ${
                  state.gameSpeed === GameSpeed.FAST
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-100 border-amber-700'
                }`}
              >
                Fast
              </button>
            </div>
          </div>

          {/* All other controls */}
          <div className={`space-y-4 mt-8 ${!canInteract(TutorialStage.BUILDING_CONSTRUCTION) ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Basic Controls */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  dispatch({ type: 'ADVANCE_WEEK' });
                  if (!state.tutorial.conditions.hasAdvancedWeek) {
                    dispatch({ 
                      type: 'UPDATE_TUTORIAL_CONDITION', 
                      payload: { condition: 'hasAdvancedWeek', value: true } 
                    });
                  }
                }}
                className="w-full bg-amber-700 text-lg px-4 py-2 rounded border-2 border-amber-900
                         hover:bg-amber-600 transition-colors text-white"
              >
                Advance Week
              </button>

              <button
                onClick={() => dispatch({ type: 'NEW_GAME' })}
                className="w-full bg-rose-700 text-lg px-4 py-2 rounded border-2 border-rose-900
                         hover:bg-rose-600 transition-colors text-white"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Ceremony Modal */}
      {salaryCeremonyOpen && state.weeklyHistory.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-amber-50 p-6 rounded-lg max-w-md w-full border-4 border-amber-900">
            <h2 className="text-2xl font-im-fell text-center mb-4 text-amber-900">
              Weekly Report
            </h2>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="font-im-fell">Week:</span>
                <span className="font-bold">{state.currentWeek - 1}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-im-fell">Revenue:</span>
                <span className="font-bold text-green-700">${state.economy.weeklyRevenue}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-im-fell">Expenses:</span>
                <span className="font-bold text-rose-700">${state.economy.weeklyExpenses}</span>
              </div>
              
              <div className="flex justify-between border-t border-amber-900 pt-2">
                <span className="font-im-fell">Net Profit:</span>
                <span className={`font-bold ${state.economy.weeklyRevenue >= state.economy.weeklyExpenses ? 'text-green-700' : 'text-rose-700'}`}>
                  ${state.economy.weeklyRevenue - state.economy.weeklyExpenses}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-im-fell">New Workers:</span>
                <span className="font-bold">
                  {state.workers.length - (state.weeklyHistory[state.weeklyHistory.length - 1]?.workerCount || 0)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-im-fell">Treasury:</span>
                <span className="font-bold">${state.treasury}</span>
              </div>
            </div>
            
            <button
              onClick={() => setSalaryCeremonyOpen(false)}
              className="mt-6 w-full bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}