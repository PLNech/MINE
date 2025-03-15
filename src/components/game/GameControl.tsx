'use client';

import { useGame } from '@/lib/context/GameContext';

export default function GameControl() {
  const { state, dispatch } = useGame();

  return (
    <div className="p-6 font-old-standard">
      <h2 className="text-2xl font-im-fell mb-6 text-gray-800 border-b-2 border-gray-800 pb-2">
        Town Ledger
      </h2>

      {/* Game Stats */}
      <div className="space-y-4 mb-8">
        <div className="stat-group">
          <h3 className="font-im-fell text-lg text-gray-800">Treasury</h3>
          <p className="text-xl">${state.treasury}</p>
        </div>

        <div className="stat-group">
          <h3 className="font-im-fell text-lg text-gray-800">Week</h3>
          <p className="text-xl">{state.currentWeek}</p>
        </div>

        <div className="stat-group">
          <h3 className="font-im-fell text-lg text-gray-800">Workers</h3>
          <p className="text-xl">{state.workers.length}</p>
        </div>

        <div className="stat-group">
          <h3 className="font-im-fell text-lg text-gray-800">Town Scale</h3>
          <p className="text-xl">{state.townScale}</p>
        </div>
      </div>

      {/* Basic Controls */}
      <div className="space-y-4">
        <button
          onClick={() => dispatch({ type: 'ADVANCE_WEEK' })}
          className="w-full bg-amber-700 text-lg px-4 py-2 rounded border-2 border-amber-900
                   hover:bg-amber-600 transition-colors"
        >
          Advance Week
        </button>

        <button
          onClick={() => dispatch({ type: 'NEW_GAME' })}
          className="w-full bg-rose-700 text-lg px-4 py-2 rounded border-2 border-rose-900
                   hover:bg-rose-600 transition-colors"
        >
          New Game
        </button>
      </div>
    </div>
  );
} 