'use client';

import { useGame } from '@/lib/context/GameContext';
import GameMap from '@/components/game/GameMap';
import GameControl from '@/components/game/GameControl';

export default function GamePage() {
  const { state } = useGame();

  return (
    <div className="min-h-screen flex flex-col bg-parchment bg-paper-texture">
      {/* Header */}
      <header className="py-4 text-center border-b-2 border-gray-800/30">
        <h1 className="text-4xl font-im-fell text-gray-800">
          The Town is <em>Mine</em>
        </h1>
      </header>

      {/* Main Game Area */}
      <main className="flex-1">
        <div className="flex h-full p-4 gap-4">
          {/* Left side - Game Controls */}
          <div className="w-1/3 game-panel border-2 border-gray-800/30 rounded-lg overflow-y-auto">
            <GameControl />
          </div>

          {/* Right side - Game Map */}
          <div className="w-2/3 game-panel border-2 border-gray-800/30 rounded-lg overflow-hidden">
            <GameMap />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-2 text-center border-t-2 border-gray-800/30">
        <p className="text-sm font-old-standard text-gray-700">
          By PLN & Raph
        </p>
      </footer>
    </div>
  );
} 