'use client';

import { useState } from 'react';
import { useGameState } from '@/lib/context/GameContext';
import { Upgrade, UpgradeType } from '@/lib/types/types';
import { calculateUpgradeCost } from '@/lib/game-engine/gameState';

export default function UpgradesPanel() {
  const { state, dispatch } = useGameState();
  const [activeTab, setActiveTab] = useState<'mine' | 'market' | 'housing'>('mine');
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Filter upgrades based on active tab
  const getTabUpgrades = (): Upgrade[] => {
    switch (activeTab) {
      case 'mine':
        return state.upgrades.filter(u => u.type === UpgradeType.MINE_CAPACITY);
      case 'market':
        return state.upgrades.filter(u => u.type === UpgradeType.MARKET_STABILITY);
      case 'housing':
        return state.upgrades.filter(u => u.type === UpgradeType.HOUSING_EFFICIENCY);
      default:
        return [];
    }
  };
  
  // Calculate and display ROI information
  const calculateROI = (upgrade: Upgrade): string => {
    const cost = calculateUpgradeCost(upgrade);
    
    switch (upgrade.type) {
      case UpgradeType.MINE_CAPACITY:
        // For mine upgrades, calculate return based on worker productivity
        const mineralPrice = state.currentMineralPrice;
        const weeklyProduction = state.baseProductionPerWorker * 7;
        const additionalRevenue = upgrade.effect.valuePerLevel * weeklyProduction * mineralPrice;
        const weeksToBreakEven = Math.ceil(cost / additionalRevenue);
        return `Break even in ~${weeksToBreakEven} weeks`;
        
      case UpgradeType.MARKET_STABILITY:
        // For market upgrades, calculate stability benefit
        const currentFluctuation = 0.2 - (upgrade.currentLevel * 0.02);
        const newFluctuation = 0.2 - ((upgrade.currentLevel + 1) * 0.02);
        const stabilityImprovement = ((currentFluctuation - newFluctuation) / currentFluctuation * 100).toFixed(0);
        return `${stabilityImprovement}% more price stability`;
        
      case UpgradeType.HOUSING_EFFICIENCY:
        // For housing upgrades, calculate additional worker capacity
        const currentMultiplier = 1 + (upgrade.currentLevel * 0.2);
        const newMultiplier = 1 + ((upgrade.currentLevel + 1) * 0.2);
        const housingBuildings = state.buildings.filter(b => 
          b.isOperational && b.effects.some(e => e.type === 'Housing')
        );
        
        let additionalCapacity = 0;
        housingBuildings.forEach(building => {
          const housingEffect = building.effects.find(e => e.type === 'Housing');
          if (housingEffect) {
            const current = Math.floor(housingEffect.value * currentMultiplier);
            const improved = Math.floor(housingEffect.value * newMultiplier);
            additionalCapacity += (improved - current);
          }
        });
        
        return `+${additionalCapacity} worker capacity`;
        
      default:
        return '';
    }
  };
  
  const renderProgressDots = (upgrade: Upgrade) => {
    const dots = [];
    for (let i = 0; i < upgrade.maxLevel; i++) {
      dots.push(
        <div 
          key={i} 
          className={`w-3 h-3 rounded-full ${i < upgrade.currentLevel ? 'bg-amber-600' : 'bg-amber-200'}`}
        />
      );
    }
    return <div className="flex space-x-1 mt-2">{dots}</div>;
  };
  
  const handlePurchase = (upgradeId: string) => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    const cost = calculateUpgradeCost(upgrade);
    
    // If expensive (more than 20% of treasury), show confirmation
    if (cost > state.treasury * 0.2) {
      setShowConfirmation(upgradeId);
    } else {
      dispatch({ type: 'PURCHASE_UPGRADE', payload: upgradeId });
    }
  };
  
  const confirmPurchase = () => {
    if (showConfirmation) {
      dispatch({ type: 'PURCHASE_UPGRADE', payload: showConfirmation });
      setShowConfirmation(null);
    }
  };
  
  const cancelPurchase = () => {
    setShowConfirmation(null);
  };
  
  // Get benefit description
  const getUpgradeBenefit = (upgrade: Upgrade): string => {
    switch (upgrade.type) {
      case UpgradeType.MINE_CAPACITY:
        const mine = state.buildings.find(b => b.type === 'Mine');
        const currentCapacity = mine ? mine.workerCapacity : 0;
        return `Mine capacity: ${currentCapacity} → ${currentCapacity + upgrade.effect.valuePerLevel} workers`;
        
      case UpgradeType.MARKET_STABILITY:
        const currentFluctuation = (0.2 - (upgrade.currentLevel * 0.02)) * 100;
        const newFluctuation = (0.2 - ((upgrade.currentLevel + 1) * 0.02)) * 100;
        return `Price fluctuation: ±${currentFluctuation}% → ±${newFluctuation}%`;
        
      case UpgradeType.HOUSING_EFFICIENCY:
        const currentBonus = upgrade.currentLevel * 20;
        const newBonus = (upgrade.currentLevel + 1) * 20;
        return `Housing capacity: +${currentBonus}% → +${newBonus}%`;
        
      default:
        return '';
    }
  };
  
  return (
    <div className="bg-amber-100 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold text-amber-900 mb-4">Upgrades & Improvements</h2>
      
      {/* Tab navigation */}
      <div className="flex border-b border-amber-300 mb-4">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'mine' ? 'text-amber-800 border-b-2 border-amber-600' : 'text-amber-600'}`}
          onClick={() => setActiveTab('mine')}
        >
          Mine
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'market' ? 'text-amber-800 border-b-2 border-amber-600' : 'text-amber-600'}`}
          onClick={() => setActiveTab('market')}
        >
          Market
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'housing' ? 'text-amber-800 border-b-2 border-amber-600' : 'text-amber-600'}`}
          onClick={() => setActiveTab('housing')}
        >
          Housing
        </button>
      </div>
      
      {/* Upgrades list */}
      <div className="space-y-4">
        {getTabUpgrades().map(upgrade => (
          <div key={upgrade.id} className="border border-amber-300 p-4 rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-amber-900">{upgrade.name}</h3>
                <p className="text-sm text-amber-700 mt-1">{upgrade.description}</p>
                <div className="mt-2 text-sm">
                  <div className="text-amber-800">{getUpgradeBenefit(upgrade)}</div>
                  <div className="text-green-600 font-medium">{calculateROI(upgrade)}</div>
                </div>
                {renderProgressDots(upgrade)}
              </div>
              <div className="text-right">
                <div className="text-amber-900 font-bold">
                  {formatCurrency(calculateUpgradeCost(upgrade))}
                </div>
                <button
                  onClick={() => handlePurchase(upgrade.id)}
                  disabled={upgrade.currentLevel >= upgrade.maxLevel || state.treasury < calculateUpgradeCost(upgrade)}
                  className={`mt-2 px-3 py-1 rounded text-white ${
                    upgrade.currentLevel >= upgrade.maxLevel 
                      ? 'bg-gray-400 cursor-not-allowed'
                      : state.treasury < calculateUpgradeCost(upgrade)
                        ? 'bg-amber-400 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {upgrade.currentLevel >= upgrade.maxLevel ? 'Maxed Out' : 'Upgrade'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Confirmation modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-amber-50 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold text-amber-900 mb-3">Confirm Purchase</h3>
            <p className="text-amber-800 mb-4">
              This upgrade will cost {formatCurrency(
                calculateUpgradeCost(state.upgrades.find(u => u.id === showConfirmation)!)
              )}, which is a significant portion of your treasury.
              Are you sure you want to proceed?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelPurchase}
                className="px-4 py-2 rounded border border-amber-300 text-amber-800 hover:bg-amber-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 