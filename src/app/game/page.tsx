'use client';

import { GameProvider } from '@/lib/context/GameContext';
import GameControls from '@/components/game/GameControls';
import GameMap from '@/components/game/GameMap';
import SalaryCeremony from '@/components/game/SalaryCeremony';
import IntroModal from '@/components/game/IntroModal';
import Header from '@/components/game/Header';
import { useGameState } from '@/lib/context/GameContext';
import ClientOnly from '@/components/ClientOnly';

function GameContent() {
  const { state } = useGameState();
  
  return (
    <div className="min-h-screen bg-amber-50">
      <Header />
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <GameControls />
        </div>
        <div className="md:w-2/3">
          <GameMap />
        </div>
      </div>
      
      {state.isCeremonyActive && <SalaryCeremony />}
      {!state.hasSeenIntro && <IntroModal />}
    </div>
  );
}

export default function Game() {
  return (
    <ClientOnly>
      <GameProvider>
        <GameContent />
      </GameProvider>
    </ClientOnly>
  );
} 