'use client';

import { useGameState } from '@/lib/context/GameContext';
import { GameSpeed } from '@/lib/types/types';
import { useState, useEffect } from 'react';
import { getRandomAnecdotes } from '@/lib/data/MiningAnecdotes';

export default function Header() {
  const { state, dispatch } = useGameState();
  const [isClient, setIsClient] = useState(false);
  const [currentAnecdote, setCurrentAnecdote] = useState<string>('');
  
  useEffect(() => {
    setIsClient(true);
    // Get a random anecdote when the component mounts
    const anecdote = getRandomAnecdotes(1)[0];
    setCurrentAnecdote(anecdote.quote);
    
    // Set up an interval to change the anecdote every 10 seconds
    const interval = setInterval(() => {
      const newAnecdote = getRandomAnecdotes(1)[0];
      setCurrentAnecdote(newAnecdote.quote);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <header className="bg-amber-900 text-amber-50 p-4 shadow-md">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold">This Town Is Mine</h1>
          {isClient && (
            <span className="text-xs bg-amber-800 px-2 py-1 rounded">
              Week {state.currentWeek}, Day {state.currentDay}
            </span>
          )}
        </div>
        
        <div className="flex space-x-6 text-sm">
          {isClient && (
            <>
              <div className="flex flex-col items-center">
                <span className="font-bold">{formatCurrency(state.treasury)}</span>
                <span className="text-xs">Treasury</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="font-bold">{state.workerCount}</span>
                <span className="text-xs">Workers</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="font-bold">{state.workerSatisfaction.toFixed(0)}%</span>
                <span className="text-xs">Satisfaction</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="font-bold">{state.workerHealth.toFixed(0)}%</span>
                <span className="text-xs">Health</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="font-bold">{state.townScale}</span>
                <span className="text-xs">Town Scale</span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded ${state.gameSpeed === GameSpeed.PAUSED ? 'bg-amber-600' : 'bg-amber-800'}`}
            onClick={() => dispatch({ type: 'SET_GAME_SPEED', payload: GameSpeed.PAUSED })}
          >
            II
          </button>
          <button 
            className={`px-3 py-1 rounded ${state.gameSpeed === GameSpeed.NORMAL ? 'bg-amber-600' : 'bg-amber-800'}`}
            onClick={() => dispatch({ type: 'SET_GAME_SPEED', payload: GameSpeed.NORMAL })}
          >
            &gt;
          </button>
          <button 
            className={`px-3 py-1 rounded ${state.gameSpeed === GameSpeed.FAST ? 'bg-amber-600' : 'bg-amber-800'}`}
            onClick={() => dispatch({ type: 'SET_GAME_SPEED', payload: GameSpeed.FAST })}
          >
            &gt;&gt;
          </button>
        </div>
      </div>

      {/* Rolling News Header */}
      <div className="bg-amber-800 text-amber-50 p-2 text-center">
        <marquee behavior="scroll" direction="left" className="whitespace-nowrap">
          {currentAnecdote}
        </marquee>
      </div>
    </header>
  );
}   