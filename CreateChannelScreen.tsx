
import React, { useState, useRef, useEffect } from 'react';
import { Channel, DEFAULT_PROFILE_PICTURE, GlobalStats } from '../types';
import { APP_VERSION, UPDATE_LOG, MAX_CHANNELS, MAX_CHANNELS_PREMIUM, PREMIUM_USERNAMES } from '../constants';
import Tooltip from '../components/Tooltip';
import UpdateLogModal from '../components/UpdateLogModal';
import PremiumModal from '../components/PremiumModal';
import GlobalStatsDisplay from '../components/GlobalStatsDisplay';


interface CreateChannelScreenProps {
  onCreateChannel: (name: string, profilePicture: string) => void;
  existingChannels: Channel[];
  onSelectChannel: (id: string) => void;
  onDeleteChannel: (id: string) => void;
  maxChannels: number;
  isPremiumUser: boolean;
  globalStats: GlobalStats;
  isDevUser: boolean;
  onOpenDevAccount: () => void;
}

const CreateChannelScreen: React.FC<CreateChannelScreenProps> = ({
  onCreateChannel,
  existingChannels,
  onSelectChannel,
  onDeleteChannel,
  maxChannels,
  isPremiumUser,
  globalStats,
  isDevUser,
  onOpenDevAccount
}) => {
  const [channelName, setChannelName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string>(DEFAULT_PROFILE_PICTURE);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUpdateLog, setShowUpdateLog] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [createButtonText, setCreateButtonText] = useState('Lanzar tu Canal');
  const [userName, setUserName] = useState(''); // Used to check for premium

   useEffect(() => {
    const storedUserName = localStorage.getItem('platformUsername') || '';
    setUserName(storedUserName.toLowerCase());
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) {
      alert('Por favor, introduce un nombre para el canal.');
      return;
    }
    if (existingChannels.length >= maxChannels) {
      alert(`Has alcanzado el límite de ${maxChannels} canales. ${!isPremiumUser && MAX_CHANNELS < MAX_CHANNELS_PREMIUM ? 'Considera obtener Premium para más espacios.' : ''}`);
      return;
    }
    onCreateChannel(channelName, profilePicture);
    setCreateButtonText('Canal Creado!');
    setTimeout(() => {
        setCreateButtonText('Lanzar tu Canal');
        setChannelName('');
        setProfilePicture(DEFAULT_PROFILE_PICTURE);
    }, 3000);
  };

  const canCreateCharacter = existingChannels.length < maxChannels;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4 text-xs text-gray-500 dark:text-gray-400">
        {APP_VERSION}
        <button onClick={() => setShowUpdateLog(true)} className="ml-2 text-blue-500 hover:underline">
          (Registro de Cambios)
        </button>
      </div>
      {showUpdateLog && <UpdateLogModal onClose={() => setShowUpdateLog(false)} updateLog={UPDATE_LOG} />}
      {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} isPremium={isPremiumUser} benefits={{
          extraSaveSlot: true,
          earningsMultiplier: 1.5,
          viewsMultiplier: 1.2,
          exclusiveBadge: true,
          reducedEnergyCosts: true,
      }} />}

      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
            <div className="flex items-center justify-center text-red-600 dark:text-red-500">
                <i className="fab fa-youtube text-5xl"></i>
                <h1 className="ml-3 text-4xl font-bold">YouTube</h1>
            </div>
            <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Studio Simulator</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Channel Section */}
          <div className={`bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl ${!canCreateCharacter ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">Crear Nuevo Canal</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-6 text-center">
                <img
                  src={profilePicture}
                  alt="Perfil"
                  className="w-32 h-32 rounded-full mx-auto mb-3 border-4 border-gray-300 dark:border-gray-600 object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!canCreateCharacter}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cambiar Imagen
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png, image/jpeg"
                  className="hidden"
                  disabled={!canCreateCharacter}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="channelName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre del Canal
                </label>
                <input
                  type="text"
                  id="channelName"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="Ej: MiCanalDeJuegos"
                  disabled={!canCreateCharacter}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!canCreateCharacter || !channelName.trim()}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createButtonText}
              </button>
              {!canCreateCharacter && (
                <p className="text-xs text-center mt-2 text-red-500 dark:text-red-400">
                  Límite de canales alcanzado. {!isPremiumUser && MAX_CHANNELS < MAX_CHANNELS_PREMIUM ? "¡Obtén Premium para más espacios!" : ""}
                </p>
              )}
            </form>
          </div>

          {/* Existing Channels Section */}
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">Canales Existentes ({existingChannels.length}/{maxChannels})</h2>
            {existingChannels.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {existingChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 cursor-pointer flex-grow" onClick={() => onSelectChannel(channel.id)}>
                      <img src={channel.profilePicture || DEFAULT_PROFILE_PICTURE} alt={channel.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{channel.name}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex space-x-2">
                          <span><i className="fas fa-users mr-1"></i>{formatNumber(channel.subscribers)}</span>
                          <span><i className="fas fa-eye mr-1"></i>{formatNumber(channel.views)}</span>
                           {channel.premiumFollowingProject && PREMIUM_USERNAMES.includes(userName) && (
                            <Tooltip text="Canal Premium">
                                <i className="fas fa-star text-yellow-400"></i>
                            </Tooltip>
                           )}
                        </div>
                      </div>
                    </div>
                    <Tooltip text="Eliminar Canal">
                        <button
                        onClick={() => onDeleteChannel(channel.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                        aria-label={`Eliminar ${channel.name}`}
                        >
                        <i className="fas fa-trash-alt"></i>
                        </button>
                    </Tooltip>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No has creado ningún canal todavía.</p>
            )}
          </div>
        </div>

        {/* Global Stats, Premium and Dev buttons */}
        <div className="mt-8 text-center space-y-4">
            <GlobalStatsDisplay stats={globalStats} />
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                    onClick={() => setShowPremiumModal(true)}
                    className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ease-in-out shadow-md hover:shadow-lg
                    ${isPremiumUser 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                    <i className={`fas ${isPremiumUser ? 'fa-star text-white' : 'fa-gem text-yellow-500'} mr-2`}></i>
                    Estado Premium {isPremiumUser ? '(Activo)' : ''}
                </button>
                {isDevUser && (
                     <button
                        onClick={onOpenDevAccount}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-200 ease-in-out"
                    >
                        <i className="fas fa-user-secret mr-2"></i>Abrir Cuenta Dev
                    </button>
                )}
            </div>

             {/* Social and Support Links */}
            <div className="pt-4 flex justify-center space-x-4">
                <a href="https://discord.gg/project" target="_blank" rel="noopener noreferrer"
                   className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    <i className="fab fa-discord text-2xl"></i>
                    <span className="sr-only">Únete a Discord</span>
                </a>
                <a href="https://buymeacoffee.com/projectwebsim" target="_blank" rel="noopener noreferrer"
                   className="text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors">
                    <i className="fas fa-mug-hot text-2xl"></i>
                    <span className="sr-only">Cómprame un café</span>
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelScreen;
