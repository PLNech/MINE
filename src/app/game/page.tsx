'use client';

import { useGame, GameProvider } from '@/lib/context/GameContext';
import { useState, useEffect } from 'react';
import { GameState, TutorialStage } from '@/lib/types/game';
import { TUTORIAL_FLOW, GAME_PARAMETERS } from '@/lib/constants/gameConstants';
import GameMap from '@/components/game/GameMap';
import GameControl from '@/components/game/GameControl';

// Create a content component to use the context
function GamePageContent() {
  const { state, dispatch } = useGame();
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentTutorialKey, setCurrentTutorialKey] = useState<keyof typeof TUTORIAL_FLOW>('INTRO_LETTER');
  const [showIntroLetter, setShowIntroLetter] = useState(true);
  const [showWorkerIntroduction, setShowWorkerIntroduction] = useState(false);
  const [initialWorkers, setInitialWorkers] = useState<any[]>([]);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  // Check for saved game on mount
  useEffect(() => {
    const savedGame = localStorage.getItem('gameState');
    setHasSavedGame(!!savedGame);
  }, []);

  // Debug state initialization
  useEffect(() => {
    console.log("Game page mounted, initial state:", {
      salary: state.salary,
      tutorial: state.tutorial
    });
  }, []);

  // Handle new game start
  const handleNewGame = () => {
    localStorage.removeItem('gameState');
    dispatch({ type: 'NEW_GAME' });
    setShowTutorial(true);
    setCurrentTutorialKey('INTRO_LETTER');
    setShowIntroLetter(true);
    setShowWorkerIntroduction(false);
    setInitialWorkers([]);
  };

  // Handle continue game
  const handleContinueGame = () => {
    const savedGame = localStorage.getItem('gameState');
    if (savedGame) {
      dispatch({ type: 'LOAD_GAME', payload: JSON.parse(savedGame) });
    }
  };

  // Debug current tutorial state
  useEffect(() => {
    const currentStep = TUTORIAL_FLOW[currentTutorialKey];
    console.log("Tutorial state:", {
      stage: currentStep.stage,
      step: currentStep.step,
      totalSteps: currentStep.totalSteps
    });
  }, [currentTutorialKey]);

  // Generate worker faces
  const generateWorkerFace = () => {
    const faces = ['👨', '👨‍🦰', '👨‍🦱', '👨‍🦳', '👩', '👩‍🦰', '👩‍🦱', '👩‍🦳'];
    const hats = ['🎩', '👒', '🧢', '⛑️', '👷‍♂️', ''];
    
    const face = faces[Math.floor(Math.random() * faces.length)];
    const hat = hats[Math.floor(Math.random() * hats.length)];
    
    return { face, hat };
  };

  // Generate worker backstories
  const generateWorkerBackstory = () => {
    const backstories = [
      "Fled a failing farm after three seasons of drought.",
      "Former railroad worker, laid off after an unfortunate incident involving dynamite.",
      "Seeking fortune after gambling away family inheritance.",
      "Arrived with nothing but the clothes on their back and unrealistic expectations.",
      "Escaped indentured servitude at a rival mining operation.",
      "Followed the promise of prosperity, found only pickaxes and promises.",
      "Abandoned a life of petty crime for the more respectable thievery of company stores.",
      "Formerly educated, now desperate enough to swing a pickaxe.",
      "Chasing rumors of gold, settling for steady wages and black lung.",
      "Arrived with a family of six, all of whom expect to eat regularly."
    ];
    
    return backstories[Math.floor(Math.random() * backstories.length)];
  };

  // Generate worker name
  const generateWorkerName = () => {
    const firstNames = ['John', 'William', 'Thomas', 'George', 'James', 'Charles', 'Henry', 'Joseph', 'Samuel', 'Robert', 
                        'Mary', 'Elizabeth', 'Sarah', 'Margaret', 'Anna', 'Jane', 'Emily', 'Catherine', 'Susan', 'Ellen'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
                       'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Young', 'Allen', 'King'];
    
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  };

  // Handle intro letter specifically
  const handleIntroLetterClose = () => {
    const nextStep = TUTORIAL_FLOW['INTRO_1'];
    dispatch({ type: 'SET_TUTORIAL_STAGE', payload: nextStep.stage });
    setCurrentTutorialKey('INTRO_1');
    setShowIntroLetter(false);
  };

  // Update the advanceTutorial function
  const advanceTutorial = () => {
    // Special handling for intro letter
    if (currentTutorialKey === 'INTRO_LETTER') {
      handleIntroLetterClose();
      return;
    }

    const currentStep = TUTORIAL_FLOW[currentTutorialKey];
    
    // Handle tutorial completion
    if (currentStep.next === 'COMPLETE') {
      dispatch({ type: 'COMPLETE_TUTORIAL' });
      setShowTutorial(false);
      return;
    }

    const nextStep = TUTORIAL_FLOW[currentStep.next];
    
    // Handle stage transitions first
    if (nextStep.stage !== currentStep.stage) {
      dispatch({ type: 'SET_TUTORIAL_STAGE', payload: nextStep.stage });
      setTimeout(() => {
        setCurrentTutorialKey(currentStep.next);
      }, 50);
    } else {
      // Same stage, just update the step
      setCurrentTutorialKey(currentStep.next);
    }
  };

  // Reset tutorial
  const resetTutorial = () => {
    console.log("Resetting tutorial to initial state");
    dispatch({ type: 'NEW_GAME' });
    setShowTutorial(true);
    setCurrentTutorialKey('INTRO_LETTER');
    setShowIntroLetter(true);
    setShowWorkerIntroduction(false);
    setInitialWorkers([]);
  };

  // Get salary color based on value
  const getSalaryColor = () => {
    if (state.salary < 20) return 'text-red-800';
    if (state.salary > 60) return 'text-green-800';
    return 'text-amber-700';
  };

  // Tutorial toast display
  const renderTutorialToast = () => {
    if (!showTutorial || state.tutorial.completed) {
      return null;
    }

    const currentStep = TUTORIAL_FLOW[currentTutorialKey];
    
    // Don't show toast for intro letter
    if (currentStep.isLetter) {
      return null;
    }

    const isLastStep = currentStep.next === 'COMPLETE';

    return (
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-2xl">
        <div className="mx-4">
          <div className="bg-amber-50 p-4 rounded-lg border-4 border-amber-900 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-im-fell text-lg text-amber-900 mb-2">
                  {currentStep.stage} ({currentStep.step}/{currentStep.totalSteps})
                </h3>
                <p className="text-gray-800">{currentStep.text}</p>
              </div>
              <button
                onClick={advanceTutorial}
                className="ml-4 px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600 transition-colors"
                disabled={currentStep.condition && !state.tutorial.conditions[currentStep.condition]}
              >
                {isLastStep ? "Complete Tutorial" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            <GameControl onResetTutorial={resetTutorial} />
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

      {/* Title Screen */}
      {showIntroLetter && (
        <div className="fixed inset-0 bg-amber-900/20 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-amber-50 p-8 rounded-lg max-w-4xl w-full mx-4 border-4 border-amber-900 shadow-2xl">
            <h1 className="text-5xl font-im-fell text-center mb-8 text-amber-900">
              The Town is <em>Mine</em>
            </h1>
            
            <div className="space-y-4">
              <button
                onClick={handleNewGame}
                className="w-full bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-600 
                         text-xl font-im-fell transition-colors shadow-lg"
              >
                New Game
              </button>
              
              {hasSavedGame && (
                <button
                  onClick={handleContinueGame}
                  className="w-full bg-amber-100 text-amber-900 px-6 py-3 rounded-lg 
                           hover:bg-amber-200 text-xl font-im-fell transition-colors 
                           border-2 border-amber-700 shadow-lg"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Intro Letter Modal */}
      {showTutorial && showIntroLetter && (
        <div className="fixed inset-0 bg-amber-900/20 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-amber-50 p-8 rounded-lg max-w-4xl w-full mx-4 border-4 border-amber-900 shadow-2xl relative">
            {/* Wax seal decoration */}
            <div className="absolute -top-16 right-0 w-24 h-24 bg-red-700 rounded-full flex items-center justify-center transform rotate-12 shadow-lg">
              <div className="text-yellow-100 text-xs text-center font-im-fell">OFFICIAL SEAL</div>
            </div>
            
            <div className="max-h-[80vh] overflow-y-auto">
              <h2 className="text-3xl font-im-fell text-center mb-6 text-amber-900">
                NOTICE OF INHERITANCE
              </h2>
              
              <div className="space-y-4 font-old-standard text-gray-800">
                <p className="first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
                  Dearest Relative (however distant),
                </p>
                
                <p>
                  It is with a mixture of sorrow and bureaucratic efficiency that I must inform you of the untimely demise of your uncle, Bartholomew Greedwell III, who has perished in what witnesses describe as "an enthusiastic attempt to swim in his own money vault." The coroner ruled it death by economic overconfidence.
                </p>
                
                <p>
                  As his closest living relation (seventeen times removed on your mother's gardener's side), you are now the proud owner of:
                </p>
                
                <ul className="list-disc pl-8 space-y-2">
                  <li className="font-bold">One (1) Moderately Productive Mine of Questionable Safety Standards</li>
                  <li className="font-bold">One Thousand Dollars ($1,000) in Capital</li>
                  <li className="font-bold">The Moral Responsibility for Several Dozen Soon-to-Be-Desperate Workers</li>
                </ul>
                
                <p>
                  The workers, much like the gears in a clock, are expecting you to wind them up with purpose and compensation. Remember, a well-oiled worker is a productive worker, though oil costs extra and comes out of your profits.
                </p>
                
                <p>
                  I have taken the liberty of assigning myself as your secretary, as the position allows me to observe the fascinating economics of human desperation while maintaining a comfortable distance from actual labor.
                </p>
                
                <p className="italic">
                  May your coffers overflow with the fruits of others' toil,
                </p>
                
                <p className="text-right font-im-fell text-xl">
                  J. Pennypincher, Esq.
                </p>
                <p className="text-right text-sm italic">
                  Secretary to the Newly Minted Mine Owner
                </p>
              </div>
              
              <button
                onClick={advanceTutorial}
                className="mt-8 w-full bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-600 text-lg font-im-fell"
              >
                Accept Your Destiny
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Worker Introduction Modal */}
      {showWorkerIntroduction && (
        <div className="fixed inset-0 bg-amber-900/20 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-amber-50 p-8 rounded-lg max-w-4xl w-full mx-4 border-4 border-amber-900 shadow-2xl">
            <h2 className="text-3xl font-im-fell text-center mb-6 text-amber-900">
              Your First Workers Have Arrived!
            </h2>
            
            <p className="mb-6 text-gray-800">
              Word of your generous salary of <span className={`font-bold ${getSalaryColor()}`}>${state.salary}</span> per week has attracted your first batch of desperate souls. Each brings their own sad story and questionable skills to your budding enterprise.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {initialWorkers.map((worker, index) => (
                <div key={index} className="border border-amber-700 rounded p-4 bg-amber-50/50 flex items-start gap-4">
                  <div className="relative">
                    <div className="text-4xl filter sepia">{worker.face}</div>
                    {worker.hat && (
                      <div className="absolute -top-3 -right-1 text-2xl transform rotate-12">{worker.hat}</div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-im-fell text-lg">{worker.name}</h3>
                    <p className="text-sm text-gray-700 italic">{worker.backstory}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={advanceTutorial}
              className="w-full bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-600 text-lg font-im-fell"
            >
              Put Them to Work
            </button>
          </div>
        </div>
      )}
      
      {/* Tutorial Toast */}
      {renderTutorialToast()}

      {/* Save game on each state change */}
      <SaveGameHandler state={state} />
    </div>
  );
}

// Component to handle auto-saving
function SaveGameHandler({ state }: { state: GameState }) {
  useEffect(() => {
    // Don't save if we're in the tutorial
    if (!state.tutorial.completed) return;
    
    // Save game state to localStorage
    localStorage.setItem('gameState', JSON.stringify(state));
  }, [state]);

  return null;
}

// Main export that wraps the content with GameProvider
export default function GamePage() {
  return (
    <GameProvider>
      <GamePageContent />
    </GameProvider>
  );
}