
import React, { useEffect } from 'react';
import { Channel } from '../types';
import { MONETIZATION_REQUIREMENTS } from '../constants';

interface MonetizationPageProps {
  channel: Channel;
  onUpdateChannel: (updatedChannel: Channel) => void;
}

const ProgressBar: React.FC<{ current: number; target: number; label: string; unit: string }> = ({ current, target, label, unit }) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className={`text-xs font-semibold ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {current.toLocaleString('es-ES')} / {target.toLocaleString('es-ES')} {unit}
          {isComplete && <i className="fas fa-check-circle ml-1"></i>}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-600'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const MonetizationPage: React.FC<MonetizationPageProps> = ({ channel, onUpdateChannel }) => {
  
  useEffect(() => {
    // Auto-check and update monetization status if requirements are met
    if (!channel.isMonetized && 
        channel.subscribers >= MONETIZATION_REQUIREMENTS.subscribers && 
        channel.watchHours >= MONETIZATION_REQUIREMENTS.watchHours) {
      onUpdateChannel({ ...channel, isMonetized: true });
      // Optionally: Add an achievement for monetization
      // This could also trigger an "inbox" message if that system were present
    }
  }, [channel, onUpdateChannel]);

  const canMonetize = channel.subscribers >= MONETIZATION_REQUIREMENTS.subscribers && channel.watchHours >= MONETIZATION_REQUIREMENTS.watchHours;

  const handleEnableMonetization = () => {
    if (canMonetize && !channel.isMonetized) {
      onUpdateChannel({ ...channel, isMonetized: true });
    }
  };
  
  const totalEarningsFormatted = channel.totalEarnings.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Monetización del Canal</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Estado de Monetización</h2>
        {channel.isMonetized ? (
          <div className="p-4 bg-green-50 dark:bg-green-900 border-l-4 border-green-500 dark:border-green-400 rounded-md">
            <div className="flex items-center">
              <i className="fas fa-check-circle text-2xl text-green-500 dark:text-green-400 mr-3"></i>
              <div>
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">¡Felicidades! Tu canal está monetizado.</h3>
                <p className="text-sm text-green-600 dark:text-green-500">Ahora puedes ganar dinero con tus videos.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-400 rounded-md">
             <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-2xl text-yellow-500 dark:text-yellow-400 mr-3"></i>
                <div>
                    <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">Tu canal aún no está monetizado.</h3>
                    <p className="text-sm text-yellow-600 dark:text-yellow-500">Cumple los requisitos para empezar a ganar dinero.</p>
                </div>
             </div>
          </div>
        )}
      </div>

      {!channel.isMonetized && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Requisitos para Monetizar</h2>
          <ProgressBar current={channel.subscribers} target={MONETIZATION_REQUIREMENTS.subscribers} label="Suscriptores" unit="" />
          <ProgressBar current={channel.watchHours} target={MONETIZATION_REQUIREMENTS.watchHours} label="Horas de Visualización Públicas" unit="horas" />
          {canMonetize && !channel.isMonetized && (
            <button
              onClick={handleEnableMonetization}
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <i className="fas fa-rocket mr-2"></i>Activar Monetización Ahora
            </button>
          )}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Resumen de Ganancias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Ganancias Totales Estimadas</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{totalEarningsFormatted}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Actual del Canal</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {channel.money.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}
                </p>
            </div>
        </div>
         {channel.isMonetized && channel.videos.length > 0 && (
            <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Ganancias por Video (Estimadas)</h3>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {channel.videos.slice(0,10).map(video => ( // Show last 10 videos
                        <div key={video.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
                            <span className="truncate text-gray-800 dark:text-gray-200" title={video.title}>{video.title}</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                +${video.moneyGained.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MonetizationPage;
