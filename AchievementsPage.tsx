
import React from 'react';
import { Channel, Achievement } from '../types';
import { ACHIEVEMENTS_LIST } from '../constants';
import Tooltip from '../components/Tooltip';

interface AchievementsPageProps {
  channel: Channel;
}

const AchievementsPage: React.FC<AchievementsPageProps> = ({ channel }) => {
  
  const isAchieved = (achievementId: string) => {
    return channel.achievements.includes(achievementId);
  };

  const getProgress = (achievement: Achievement): { current: number; target: number; percentage: number } => {
    let current = 0;
    const target = achievement.milestoneValue;

    switch (achievement.milestoneType) {
      case 'subscribers': current = channel.subscribers; break;
      case 'views': current = channel.views; break;
      case 'watchHours': current = channel.watchHours; break;
      case 'money': current = channel.money; break; // This refers to current money, could be totalEarnings
      case 'totalEarnings': current = channel.totalEarnings; break;
      case 'videosUploaded': current = channel.videos.length; break;
      default: current = 0;
    }
    return { current, target, percentage: Math.min((current / target) * 100, 100) };
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Logros del Canal</h1>
      
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          ¡Completa estos hitos para ganar recompensas y mostrar tu progreso como creador de contenido!
        </p>
        <div className="space-y-4">
          {ACHIEVEMENTS_LIST.map((achievement) => {
            const achieved = isAchieved(achievement.id);
            const progress = getProgress(achievement);
            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center transition-all duration-300
                           ${achieved 
                             ? 'bg-green-50 dark:bg-green-900 border-green-500 dark:border-green-400 shadow-md' 
                             : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:shadow-md'
                           }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4 mb-3 sm:mb-0
                               ${achieved ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-400 dark:bg-gray-500'}`}>
                  <i className={`${achievement.icon} text-xl ${achieved ? 'text-white' : 'text-white'}`}></i>
                </div>
                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <h3 className={`text-lg font-semibold ${achieved ? 'text-green-700 dark:text-green-300' : 'text-gray-800 dark:text-white'}`}>
                      {achievement.name}
                    </h3>
                    {achieved && (
                      <Tooltip text="Logro Completado">
                         <span className="text-xs font-bold uppercase px-2 py-1 bg-green-200 dark:bg-green-700 text-green-700 dark:text-green-200 rounded-full">
                            COMPLETADO <i className="fas fa-check ml-1"></i>
                         </span>
                      </Tooltip>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{achievement.description}</p>
                  {!achieved && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                        <span>Progreso</span>
                        <span>{progress.current.toLocaleString('es-ES')} / {progress.target.toLocaleString('es-ES')}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                        <div 
                          className="bg-red-500 dark:bg-red-600 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${progress.percentage}%`}}
                        ></div>
                      </div>
                    </div>
                  )}
                   {achievement.reward && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                      <i className="fas fa-gift mr-1"></i>
                      Recompensa: 
                      {achievement.reward.money && ` $${achievement.reward.money}`}
                      {achievement.reward.money && achievement.reward.energyBoost && ', '}
                      {achievement.reward.energyBoost && ` +${achievement.reward.energyBoost} Energía Máx.`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
