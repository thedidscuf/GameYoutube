
import React from 'react';
import { GlobalStats } from '../types';

interface GlobalStatsDisplayProps {
  stats: GlobalStats;
  showTitle?: boolean;
}

const GlobalStatsDisplay: React.FC<GlobalStatsDisplayProps> = ({ stats, showTitle = true }) => {
  const formatStat = (value: number) => value.toLocaleString('es-ES');

  const statItems = [
    { label: 'Canales Creados Globalmente', value: formatStat(stats.totalChannelsCreated), icon: 'fas fa-users-cog' },
    { label: 'Suscriptores Totales (Global)', value: formatStat(stats.totalSubscribers), icon: 'fas fa-users' },
    { label: 'Vistas Totales (Global)', value: formatStat(stats.totalViews), icon: 'fas fa-eye' },
    { label: 'Dinero Ganado (Global)', value: `$${formatStat(stats.totalMoneyEarned)}`, icon: 'fas fa-hand-holding-usd' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
      {showTitle && <h3 className="text-xl font-semibold mb-4 text-center text-gray-700 dark:text-gray-200">Estadísticas Globales del Simulador</h3>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
        {statItems.map((item, index) => (
          <div key={index} className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow flex items-center">
            <i className={`${item.icon} text-lg text-red-500 dark:text-red-400 mr-3 w-5 text-center`}></i>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{item.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalStatsDisplay;
