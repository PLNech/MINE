'use client';

import { useState } from 'react';
import { useGameState } from '@/lib/context/GameContext';
import { SavedGameState } from '@/lib/types/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { state, dispatch } = useGameState();
  const [saveFileName, setSaveFileName] = useState('');

  const handleExportToClipboard = () => {
    const savedState = JSON.stringify(
      {
        version: '1.0.0',
        timestamp: Date.now(),
        state
      },
      null,
      2
    );
    
    navigator.clipboard.writeText(savedState).then(() => {
      alert('Game state copied to clipboard!');
    });
  };

  const handleExportToFile = () => {
    const fileName = saveFileName || `save_mine_${new Date().toISOString().split('T')[0]}.json`;
    const savedState = JSON.stringify(
      {
        version: '1.0.0',
        timestamp: Date.now(),
        state
      },
      null,
      2
    );
    
    const blob = new Blob([savedState], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFromClipboard = () => {
    navigator.clipboard.readText().then((text) => {
      try {
        const savedState: SavedGameState = JSON.parse(text);
        dispatch({ type: 'IMPORT_SAVE', payload: savedState });
        alert('Game state imported successfully!');
      } catch (error) {
        alert('Invalid save data');
      }
    });
  };

  const handleImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const savedState: SavedGameState = JSON.parse(e.target?.result as string);
          dispatch({ type: 'IMPORT_SAVE', payload: savedState });
          alert('Game state imported successfully!');
        } catch (error) {
          alert('Invalid save file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to reset the game? This will keep your achievements.')) {
      dispatch({ type: 'RESET_GAME' });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-amber-50 p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-amber-900 mb-4">Game Settings</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">Save Game</h3>
            <div className="space-y-2">
              <button 
                onClick={handleExportToClipboard}
                className="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700"
              >
                Export to Clipboard
              </button>
              
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Save filename (optional)"
                  value={saveFileName}
                  onChange={(e) => setSaveFileName(e.target.value)}
                  className="flex-grow px-2 py-1 border border-amber-300 rounded"
                />
                <button 
                  onClick={handleExportToFile}
                  className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
                >
                  Export to File
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">Load Game</h3>
            <div className="space-y-2">
              <button 
                onClick={handleImportFromClipboard}
                className="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700"
              >
                Import from Clipboard
              </button>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleImportFromFile}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <button 
                  className="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700"
                >
                  Import from File
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">Game Reset</h3>
            <button 
              onClick={handleResetGame}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
            >
              Reset Game (Keep Achievements)
            </button>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="mt-6 w-full bg-amber-200 text-amber-900 py-2 rounded hover:bg-amber-300"
        >
          Close
        </button>
      </div>
    </div>
  );
} 