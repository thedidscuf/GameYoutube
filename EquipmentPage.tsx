
import React, { useState } from 'react';
import { Channel, EquipmentType, EquipmentItem, EquipmentLevelDetail } from '../types';
import { EQUIPMENT_DATA, INITIAL_MAX_ENERGY } from '../constants';
import Tooltip from '../components/Tooltip';

interface EquipmentPageProps {
  channel: Channel;
  onUpdateChannel: (updatedChannel: Channel) => void;
}

interface EquipmentCardProps {
  itemType: EquipmentType;
  itemData: EquipmentItem;
  currentLevel: number;
  money: number;
  onUpgrade: (type: EquipmentType, cost: number, newLevel: number, newMaxEnergy?: number) => void;
  channelMaxEnergy: number; 
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ 
  itemType, 
  itemData, 
  currentLevel, 
  money, 
  onUpgrade, 
  channelMaxEnergy 
}) => {
  const nextLevelDetail = itemData.levels.find(l => l.level === currentLevel + 1);
  const canUpgrade = nextLevelDetail && money >= nextLevelDetail.cost;
  const isMaxLevel = currentLevel === itemData.levels.length;

  const handleUpgrade = () => {
    if (nextLevelDetail && canUpgrade) {
      let newMaxEnergyCalculated = undefined;
      if (itemType === EquipmentType.DECORATION && nextLevelDetail.statBoost) {
        // Get current item's boost to subtract it before adding new boost
        const currentItemLevelDetail = itemData.levels.find(l => l.level === currentLevel);
        const currentBoost = currentItemLevelDetail?.statBoost || 0;
        
        // Calculate new max energy: Start from base (or current maxEnergy - current item's contribution) + new item's contribution
        // This assumes statBoost for decoration is the absolute value it sets maxEnergy to, or an addition.
        // For simplicity, let's assume statBoost is an *additional* value.
        // Max energy without this item's current boost:
        const baseMaxEnergy = (channelMaxEnergy || INITIAL_MAX_ENERGY) - currentBoost;
        newMaxEnergyCalculated = baseMaxEnergy + nextLevelDetail.statBoost;

      }
      onUpgrade(itemType, nextLevelDetail.cost, nextLevelDetail.level, newMaxEnergyCalculated);
    }
  };

  const renderStars = (level: number, maxLevels: number) => {
    return (
      <div className="flex items-center my-1">
        {Array.from({ length: maxLevels }).map((_, i) => (
          <i
            key={i}
            className={`fas fa-star text-xl ${i < level ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          ></i>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center mb-3">
          <i className={`${itemData.icon} text-3xl text-red-500 dark:text-red-400 mr-4`}></i>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{itemData.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{itemData.description}</p>
          </div>
        </div>
        
        {renderStars(currentLevel, itemData.levels.length)}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          Nivel Actual: {itemData.levels[currentLevel -1].description}
        </p>
        {itemData.levels[currentLevel -1].statBoost && (
             <p className="text-xs text-blue-500 dark:text-blue-400 mb-3">
                {itemType === EquipmentType.DECORATION ? `+${itemData.levels[currentLevel -1].statBoost} Energía Máx.` : `+${(itemData.levels[currentLevel -1].statBoost || 0) * 100}% Boost`}
            </p>
        )}


        {!isMaxLevel && nextLevelDetail && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Siguiente Nivel: {nextLevelDetail.description}</p>
            {nextLevelDetail.statBoost && (
                <p className="text-xs text-blue-500 dark:text-blue-400">
                    {itemType === EquipmentType.DECORATION ? `+${nextLevelDetail.statBoost} Energía Máx.` : `+${(nextLevelDetail.statBoost || 0) * 100}% Boost`}
                </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">Costo: ${nextLevelDetail.cost.toLocaleString('es-ES')}</p>
          </div>
        )}
        {isMaxLevel && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">¡Nivel Máximo Alcanzado!</p>
        )}
      </div>

      {!isMaxLevel && nextLevelDetail && (
        <Tooltip text={!canUpgrade ? `Necesitas $${nextLevelDetail.cost.toLocaleString('es-ES')}` : 'Mejorar equipamiento'}>
          <button
            onClick={handleUpgrade}
            disabled={!canUpgrade}
            className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
          >
            {canUpgrade ? 'Mejorar' : `Insuficiente ($${nextLevelDetail.cost.toLocaleString('es-ES')})`}
          </button>
        </Tooltip>
      )}
    </div>
  );
};

const EquipmentPage: React.FC<EquipmentPageProps> = ({ channel, onUpdateChannel }) => {
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleUpgrade = (type: EquipmentType, cost: number, newLevel: number, newMaxEnergyCalculated?: number) => {
    if (channel.money >= cost) {
      const newEquipmentLevels = { ...channel.equipment, [type]: newLevel };
      const updatedChannelData: Partial<Channel> = { // Use Partial<Channel> for clarity
        money: channel.money - cost,
        equipment: newEquipmentLevels,
      };

      if (type === EquipmentType.DECORATION && newMaxEnergyCalculated !== undefined) {
         // For decoration, the statBoost is *additional* energy.
         // The old boost is already part of channel.maxEnergy.
         // We need to find the difference in boost.
        const oldLevelDetail = EQUIPMENT_DATA[EquipmentType.DECORATION].levels.find(l => l.level === (newLevel -1));
        const oldBoost = oldLevelDetail?.statBoost || 0; // Boost of the level being upgraded FROM
        const newLevelDetail = EQUIPMENT_DATA[EquipmentType.DECORATION].levels.find(l => l.level === newLevel);
        const newBoost = newLevelDetail?.statBoost || 0; // Boost of the level being upgraded TO
        
        const boostDifference = newBoost - oldBoost;
        updatedChannelData.maxEnergy = (channel.maxEnergy || INITIAL_MAX_ENERGY) + boostDifference;

        if (channel.energy > updatedChannelData.maxEnergy) {
            updatedChannelData.energy = updatedChannelData.maxEnergy;
        }
      }
      
      onUpdateChannel({ ...channel, ...updatedChannelData } as Channel); // Cast to Channel after merging
      setFeedback({type: 'success', message: `${EQUIPMENT_DATA[type].name} mejorado a nivel ${newLevel}!`});
    } else {
      setFeedback({type: 'error', message: `No tienes suficiente dinero para esta mejora.`});
    }
    setTimeout(() => setFeedback(null), 3000);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Equipamiento del Canal</h1>

      {feedback && (
        <div className={`p-3 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'}`}>
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {Object.entries(EQUIPMENT_DATA).map(([key, itemData]) => (
          <EquipmentCard
            key={key}
            itemType={key as EquipmentType}
            itemData={itemData}
            currentLevel={channel.equipment[key as EquipmentType]}
            money={channel.money}
            onUpgrade={handleUpgrade}
            channelMaxEnergy={channel.maxEnergy || INITIAL_MAX_ENERGY}
          />
        ))}
      </div>
    </div>
  );
};

export default EquipmentPage;
