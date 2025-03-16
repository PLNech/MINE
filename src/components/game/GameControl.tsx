'use client';

import { useGame } from '@/lib/context/GameContext';
import { GameSpeed, NotificationType } from '@/lib/types/game';
import { GAME_PARAMETERS, TUTORIAL_FLOW } from '@/lib/constants/gameConstants';
import { useState, useEffect } from 'react';
import { TutorialStage } from '@/lib/types/game';

interface GameControlProps {
  onResetTutorial: () => void;
}

export default function GameControl({ onResetTutorial }: GameControlProps) {
  const { state, dispatch } = useGame();
  const [salaryCeremonyOpen, setSalaryCeremonyOpen] = useState(false);
  console.log("GameControl rendering, dispatch function:", typeof dispatch);

  useEffect(() => {
    console.log("GameControl received new state:", state.salary);
  }, [state]);

  // Calculate projected worker migration based on salary
  const projectedMigration = Math.round(((state.salary - GAME_PARAMETERS.MIN_WAGE) / 
    (GAME_PARAMETERS.MAX_WAGE - GAME_PARAMETERS.MIN_WAGE)) * 50);
  
  // Calculate weekly expenses
  const weeklyExpenses = state.workers.length * state.salary;

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    console.log("Direct slider change detected:", newValue);
    
    // Direct dispatch
    dispatch({ 
      type: 'SET_SALARY', 
      payload: newValue 
    });
  };

  // Get salary color based on value
  const getSalaryColor = () => {
    if (state.salary < 20) return 'text-red-800';
    if (state.salary > 60) return 'text-green-800';
    return 'text-amber-700';
  };
  
  return (
    <div className="p-6 font-old-standard">
      {/* Always visible controls */}
      <div className="space-y-6">
        {/* Salary Control */}
        <div className="p-4 bg-amber-100 border-2 border-amber-700 rounded shadow-md">
          <h3 className="font-im-fell text-xl text-gray-800 mb-3">Weekly Salary</h3>
          <div className="flex items-center space-x-4">
            <span className={`text-xl font-bold ${getSalaryColor()}`}>${state.salary}</span>
            <input
              type="range"
              min={GAME_PARAMETERS.MIN_WAGE}
              max={GAME_PARAMETERS.MAX_WAGE}
              value={state.salary}
              onChange={(e) => {
                const newSalary = parseInt(e.target.value);
                console.log("Slider changed to:", newSalary);
                dispatch({ type: 'SET_SALARY', payload: newSalary });
              }}
              className="flex-grow h-3 appearance-none rounded-full bg-amber-300 outline-none"
              data-testid="salary-slider"
            />
          </div>
          
          {/* Alternative controls for testing */}
          <div className="mt-3 flex justify-between">
            <button
              onClick={() => {
                const newSalary = Math.max(GAME_PARAMETERS.MIN_WAGE, state.salary - 5);
                console.log("Decreasing salary to:", newSalary);
                dispatch({ type: 'SET_SALARY', payload: newSalary });
              }}
              className="px-2 py-1 bg-amber-700 text-white rounded text-sm"
            >
              -$5
            </button>
            
            <button
              onClick={() => {
                const newSalary = Math.min(GAME_PARAMETERS.MAX_WAGE, state.salary + 5);
                console.log("Increasing salary to:", newSalary);
                dispatch({ type: 'SET_SALARY', payload: newSalary });
              }}
              className="px-2 py-1 bg-amber-700 text-white rounded text-sm"
            >
              +$5
            </button>
          </div>
          
          <div className="mt-3 text-sm text-gray-700">
            <p>Projected worker migration: <span className="font-bold">{projectedMigration} workers/week</span></p>
          </div>
        </div>


        {/* Stats */}
        <div className={`space-y-4`}>
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
          <div className={`space-y-4 mt-8`}>
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