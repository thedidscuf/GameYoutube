
import React from 'react';
import { Channel, Video } from '../types';

interface DashboardPageProps {
  channel: Channel;
  onUpdateChannel: (updatedChannel: Channel) => void; // For actions like "Skip Day" if moved here
}

const StatCard: React.FC<{ title: string; value: string | number; icon: string; colorClass: string; darkColorClass: string }> = 
  ({ title, value, icon, colorClass, darkColorClass }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      <div className={`p-2 rounded-full ${colorClass} ${darkColorClass} text-white`}>
        <i className={`${icon} text-xl`}></i>
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString('es-ES') : value}</p>
  </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ channel }) => {
  const latestVideos = channel.videos.slice(0, 5);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };
  
  const formatDate = (timestamp: number) => {
    // Simplified in-game date based on channel day
    const baseDate = new Date(channel.creationDate);
    baseDate.setDate(baseDate.getDate() + Math.floor((timestamp - channel.creationDate) / (1000 * 60 * 60 * 24))); // Approximate day based on timestamp
    return `Día ${channel.day + Math.floor((timestamp - channel.creationDate) / (1000 * 60 * 60 * 24))}`; // This is a rough in-game time
  };


  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Panel de Control del Canal</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Suscriptores" value={formatNumber(channel.subscribers)} icon="fas fa-users" colorClass="bg-red-500" darkColorClass="dark:bg-red-600" />
        <StatCard title="Vistas Totales" value={formatNumber(channel.views)} icon="fas fa-eye" colorClass="bg-blue-500" darkColorClass="dark:bg-blue-600" />
        <StatCard title="Dinero (USD)" value={`$${channel.money.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} icon="fas fa-dollar-sign" colorClass="bg-green-500" darkColorClass="dark:bg-green-600" />
        <StatCard title="Horas de Visualización" value={channel.watchHours.toLocaleString('es-ES', {minimumFractionDigits: 1, maximumFractionDigits: 1})} icon="fas fa-hourglass-half" colorClass="bg-yellow-500" darkColorClass="dark:bg-yellow-600" />
      </div>

      {/* Recent Videos */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Videos Recientes</h2>
        {latestVideos.length > 0 ? (
          <div className="space-y-3 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Título</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha (Juego)</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vistas</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subs Ganados</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {latestVideos.map((video: Video) => (
                  <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{video.title}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(video.uploadDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatNumber(video.views)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">+{formatNumber(video.subscribersGained)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">No has subido ningún video todavía.</p>
        )}
      </div>
      
      {/* Quick Actions (Example, functionality would be in Header or specific modals) */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Acciones Rápidas</h2>
        <div className="flex flex-wrap gap-3">
            <button className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors shadow focus:outline-none focus:ring-2 focus:ring-red-400">
                <i className="fas fa-upload mr-2"></i>Subir Video (desde Header)
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-400">
                <i className="fas fa-calendar-day mr-2"></i>Avanzar Día (desde Header)
            </button>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
