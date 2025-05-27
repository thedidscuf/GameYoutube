
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Channel, DEFAULT_PROFILE_PICTURE, GlobalStats } from '../types';
import { ENERGY_REGEN_PER_DAY, INITIAL_MAX_ENERGY, PREMIUM_USERNAMES, DEV_USERNAMES } from '../constants';
import Tooltip from './Tooltip';
import ConfirmModal from './ConfirmModal';
import { ThemeContext } from '../App';
import GlobalStatsDisplay from './GlobalStatsDisplay'; 
import PremiumModal from './PremiumModal';

interface HeaderProps {
  channelName: string;
  profilePicture: string;
  money: number;
  onSwitchChannel: () => void;
  onToggleSidebar: () => void;
  onUploadVideo: () => void;
  currentChannelId: string;
  allChannels: Channel[];
  onSelectChannel: (id: string) => void;
  isPremiumUser: boolean;
  channel: Channel;
  onUpdateChannel: (updatedChannel: Channel) => void;
  globalStats: GlobalStats;
  isDevUser: boolean;
  onOpenDevAccount: () => void;
}

const Header: React.FC<HeaderProps> = ({
  channelName,
  profilePicture,
  money,
  onSwitchChannel,
  onToggleSidebar,
  onUploadVideo,
  currentChannelId,
  allChannels,
  onSelectChannel,
  isPremiumUser,
  channel,
  onUpdateChannel,
  globalStats,
  isDevUser,
  onOpenDevAccount
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChannelSwitcher, setShowChannelSwitcher] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const channelSwitcherRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [showSkipDayConfirm, setShowSkipDayConfirm] = useState(false);
  const [isSkippingDay, setIsSkippingDay] = useState(false);
  const [showOnlineStats, setShowOnlineStats] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedUserName = localStorage.getItem('platformUsername') || '';
    setUserName(storedUserName.toLowerCase());

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (channelSwitcherRef.current && !channelSwitcherRef.current.contains(event.target as Node)) {
        setShowChannelSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSkipDay = () => {
    setShowSkipDayConfirm(true);
  };

  const confirmSkipDay = () => {
    setShowSkipDayConfirm(false);
    setIsSkippingDay(true);

    // Simulate day skip effects
    setTimeout(() => {
      let newEnergy = channel.energy + ENERGY_REGEN_PER_DAY;
      const maxEnergy = channel.maxEnergy || INITIAL_MAX_ENERGY;
      if (newEnergy > maxEnergy) {
        newEnergy = maxEnergy;
      }

      // Simulate view/sub changes for existing videos (simplified)
      const updatedVideos = channel.videos.map(video => {
        const dailyViews = Math.floor(video.views * 0.05 * (Math.random() * 0.5 + 0.75)); // 5% of current views, +-25% randomness
        const dailySubs = Math.floor(dailyViews * 0.01 * (Math.random() * 0.5 + 0.75)); // 1% of daily views, +-25% randomness
        return {
          ...video,
          views: video.views + dailyViews,
          subscribersGained: video.subscribersGained + dailySubs,
        };
      });
      
      const totalNewSubsFromSkip = updatedVideos.reduce((sum, v) => sum + (v.subscribersGained - (channel.videos.find(ov => ov.id === v.id)?.subscribersGained || 0)), 0);

      const updatedChannel = {
        ...channel,
        day: channel.day + 1,
        energy: newEnergy,
        videos: updatedVideos,
        subscribers: channel.subscribers + totalNewSubsFromSkip,
        views: channel.views + updatedVideos.reduce((sum, v) => sum + (v.views - (channel.videos.find(ov => ov.id === v.id)?.views || 0)),0),
      };
      onUpdateChannel(updatedChannel);
      setIsSkippingDay(false);
    }, 1500); // Simulate loading time
  };
  
  const formatMoney = (amount: number) => {
    return amount.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-3 sm:p-4 flex items-center justify-between z-10">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="mr-3 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 focus:outline-none"
          title="Alternar barra lateral"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
        <Tooltip text="Saltar al día siguiente (+Energía, actualiza videos)">
          <button
            onClick={handleSkipDay}
            disabled={isSkippingDay}
            className="hidden sm:flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow transition-colors disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <i className={`fas ${isSkippingDay ? 'fa-spinner fa-spin' : 'fa-calendar-day'} mr-2`}></i>
            Día {channel.day} {isSkippingDay ? '' : '(Avanzar)'}
          </button>
        </Tooltip>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <Tooltip text="Subir Nuevo Video">
          <button
            onClick={onUploadVideo}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg text-sm shadow transition-colors"
          >
            <i className="fas fa-upload mr-0 sm:mr-2"></i>
            <span className="hidden sm:inline">Crear</span>
          </button>
        </Tooltip>

        <div className="hidden md:flex items-center text-sm text-gray-700 dark:text-gray-200">
            <i className="fas fa-dollar-sign text-green-500 mr-1"></i>
            <span>{formatMoney(money)}</span>
        </div>
        
        <div className="flex items-center text-sm text-yellow-500 dark:text-yellow-400">
            <i className="fas fa-bolt mr-1"></i>
            <span>{channel.energy}/{channel.maxEnergy}</span>
        </div>

        <div className="theme-switch-wrapper">
          <label className="theme-switch" htmlFor="theme-checkbox">
            <input type="checkbox" id="theme-checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
            <div className="slider-theme round"></div>
          </label>
          <i className={`fas ${theme === 'dark' ? 'fa-moon moon-icon' : 'fa-sun sun-icon'} theme-switch-icon`}></i>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowDropdown(!showDropdown)} className="focus:outline-none">
            <img
              src={profilePicture || DEFAULT_PROFILE_PICTURE}
              alt="Perfil"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 object-cover hover:opacity-90 transition-opacity"
            />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-xl z-20 border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <img src={profilePicture || DEFAULT_PROFILE_PICTURE} alt={channelName} className="w-12 h-12 rounded-full mr-3 object-cover" />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{channelName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: ...{currentChannelId.slice(-6)}</p>
                  </div>
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setShowChannelSwitcher(true); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <i className="fas fa-sync-alt mr-2 w-4 text-center"></i>Cambiar Canal
                </button>
                 <button
                    onClick={() => { setShowOnlineStats(true); setShowDropdown(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <i className="fas fa-globe mr-2 w-4 text-center"></i>Estadísticas Online
                </button>
                <button
                    onClick={() => { setShowPremiumModal(true); setShowDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        isPremiumUser 
                        ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <i className={`fas ${isPremiumUser ? 'fa-star' : 'fa-gem'} mr-2 w-4 text-center`}></i>
                    Estado Premium
                </button>
                {isDevUser && (
                    <button
                        onClick={() => { onOpenDevAccount(); setShowDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors"
                    >
                        <i className="fas fa-user-secret mr-2 w-4 text-center"></i>Cuenta Dev
                    </button>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={() => { onSwitchChannel(); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700 transition-colors"
                >
                  <i className="fas fa-plus-circle mr-2 w-4 text-center"></i>Administrar Canales
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showChannelSwitcher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
          <div ref={channelSwitcherRef} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Cambiar de Canal</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allChannels.filter(ch => ch.id !== currentChannelId).map(ch => (
                <button
                  key={ch.id}
                  onClick={() => { onSelectChannel(ch.id); setShowChannelSwitcher(false); }}
                  className="w-full flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <img src={ch.profilePicture || DEFAULT_PROFILE_PICTURE} alt={ch.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-left">{ch.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-left">Subs: {ch.subscribers.toLocaleString()}</p>
                  </div>
                   {ch.premiumFollowingProject && PREMIUM_USERNAMES.includes(userName) && (
                    <Tooltip text="Canal Premium">
                        <i className="fas fa-star text-yellow-400 ml-auto"></i>
                    </Tooltip>
                   )}
                </button>
              ))}
              {allChannels.filter(ch => ch.id !== currentChannelId).length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay otros canales disponibles.</p>
              )}
            </div>
            <button
              onClick={() => setShowChannelSwitcher(false)}
              className="mt-6 w-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      {showSkipDayConfirm && (
        <ConfirmModal
          title="Avanzar Día"
          message={`¿Estás seguro de que quieres avanzar al Día ${channel.day + 1}? Esto regenerará energía y tus videos podrían ganar vistas/subs.`}
          onConfirm={confirmSkipDay}
          onCancel={() => setShowSkipDayConfirm(false)}
          confirmText="Sí, avanzar"
          isLoading={isSkippingDay}
        />
      )}
       {showOnlineStats && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Estadísticas Globales</h2>
                        <button onClick={() => setShowOnlineStats(false)} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-2xl">&times;</button>
                    </div>
                    <GlobalStatsDisplay stats={globalStats} showTitle={false} />
                     {/* Placeholder for leaderboard - in a real app, this would fetch data */}
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Tabla de Líderes (Simulada)</h3>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 max-h-60 overflow-y-auto">
                            {allChannels.sort((a,b) => b.subscribers - a.subscribers).slice(0,5).map((ch, index) => (
                                <div key={ch.id} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                    <span>{index+1}. {ch.name}</span>
                                    <span>{ch.subscribers.toLocaleString()} subs</span>
                                </div>
                            ))}
                            {allChannels.length === 0 && <p>No hay canales para mostrar.</p>}
                        </div>
                    </div>
                </div>
            </div>
        )}
        {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} isPremium={isPremiumUser} benefits={{
          extraSaveSlot: true,
          earningsMultiplier: 1.5,
          viewsMultiplier: 1.2,
          exclusiveBadge: true,
          reducedEnergyCosts: true,
        }} />}
    </header>
  );
};

export default Header;
