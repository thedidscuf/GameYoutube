
import React, { useState, useEffect, useCallback } from 'react';
import { Channel, DEFAULT_PROFILE_PICTURE, GlobalStats, PremiumBenefits, Video } from './types';
import { MAX_CHANNELS, MAX_CHANNELS_PREMIUM, APP_VERSION, PREMIUM_USERNAMES, PREMIUM_BENEFITS_DETAILS, DEV_USERNAMES, MONETIZATION_REQUIREMENTS, ENERGY_PER_VIDEO, INITIAL_MAX_ENERGY } from './constants';
import CreateChannelScreen from './screens/CreateChannelScreen';
import GameLayout from './screens/GameLayout';
import LoadingScreen from './components/LoadingScreen';
import ConfirmModal from './components/ConfirmModal';
import NewGamePopup from './components/NewGamePopup';

export type Theme = 'light' | 'dark';

export const ThemeContext = React.createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: 'light',
  toggleTheme: () => {},
});

const App: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCreateChannel, setShowCreateChannel] = useState<boolean>(false);
  const [isFullScreenLogo, setIsFullScreenLogo] = useState<boolean>(false);
  const [showNewGamePopup, setShowNewGamePopup] = useState<boolean>(false);

  const [theme, setTheme] = useState<Theme>('light');

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmModalProps, setConfirmModalProps] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);

  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  const [isDevUser, setIsDevUser] = useState<boolean>(false); // For dev account access

  // Global Stats State
   const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalChannelsCreated: 0,
    totalSubscribers: 0,
    totalViews: 0,
    totalMoneyEarned: 0,
  });


  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Prefer dark mode if system prefers it
      if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      } else {
        setTheme('light');
        document.documentElement.classList.remove('dark');
      }
    }

    // Check for 1:1 aspect ratio
    const checkAspectRatio = () => {
      if (window.innerWidth > 0 && window.innerWidth === window.innerHeight) {
        setIsFullScreenLogo(true);
      } else {
        setIsFullScreenLogo(false);
      }
    };
    checkAspectRatio();
    window.addEventListener('resize', checkAspectRatio);
    
    // Show new game popup once
    const hasSeenPopup = localStorage.getItem('hasSeenNewGamePopup');
    if (!hasSeenPopup) {
      setShowNewGamePopup(true);
    }

    loadChannels();
    loadGlobalStats();

    // Simulate checking premium status
    // In a real app, this would involve an API call or checking platform context
    const currentPlatformUser = localStorage.getItem('platformUsername') || ''; // Mocked
    if (PREMIUM_USERNAMES.includes(currentPlatformUser.toLowerCase())) {
      setIsPremiumUser(true);
    }
    if (DEV_USERNAMES.includes(currentPlatformUser.toLowerCase())) {
        setIsDevUser(true);
    }


    return () => window.removeEventListener('resize', checkAspectRatio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return newTheme;
    });
  };


  const loadChannels = () => {
    setIsLoading(true);
    try {
      const storedChannels = localStorage.getItem('youtubeChannels_v2');
      if (storedChannels) {
        const parsedChannels: Channel[] = JSON.parse(storedChannels);
        setChannels(parsedChannels);
        const lastActiveId = localStorage.getItem('lastActiveChannelId_v2');
        if (lastActiveId && parsedChannels.some(c => c.id === lastActiveId)) {
          setActiveChannelId(lastActiveId);
        } else if (parsedChannels.length > 0) {
          setActiveChannelId(parsedChannels[0].id);
        } else {
          setShowCreateChannel(true);
        }
      } else {
        setShowCreateChannel(true);
      }
    } catch (error) {
      console.error("Error al cargar canales:", error);
      setShowCreateChannel(true); // Fallback to creation screen
    }
    setIsLoading(false);
  };

  const saveChannels = useCallback((updatedChannels: Channel[], newActiveId?: string) => {
    localStorage.setItem('youtubeChannels_v2', JSON.stringify(updatedChannels));
    if (newActiveId) {
        localStorage.setItem('lastActiveChannelId_v2', newActiveId);
    } else if (activeChannelId) {
        localStorage.setItem('lastActiveChannelId_v2', activeChannelId);
    }
    updateGlobalStatsFromChannels(updatedChannels);
  }, [activeChannelId]);


  const loadGlobalStats = () => {
    const storedStats = localStorage.getItem('youtubeGlobalStats_v2');
    if (storedStats) {
      setGlobalStats(JSON.parse(storedStats));
    }
  };

  const saveGlobalStats = (stats: GlobalStats) => {
    localStorage.setItem('youtubeGlobalStats_v2', JSON.stringify(stats));
    setGlobalStats(stats);
  };
  
  const updateGlobalStatsFromChannels = (allChannels: Channel[]) => {
    const newTotalChannels = allChannels.length;
    const newTotalSubs = allChannels.reduce((sum, ch) => sum + ch.subscribers, 0);
    const newTotalViews = allChannels.reduce((sum, ch) => sum + ch.views, 0);
    const newTotalMoney = allChannels.reduce((sum, ch) => sum + ch.totalEarnings, 0);
    saveGlobalStats({
        totalChannelsCreated: newTotalChannels,
        totalSubscribers: newTotalSubs,
        totalViews: newTotalViews,
        totalMoneyEarned: newTotalMoney,
    });
  };


  const handleCreateChannel = (name: string, profilePicture: string) => {
    setIsLoading(true);
    const maxSlots = isPremiumUser ? MAX_CHANNELS_PREMIUM : MAX_CHANNELS;
    if (channels.length >= maxSlots) {
      alert(`Has alcanzado el límite de ${maxSlots} canales.`);
      setIsLoading(false);
      return;
    }
    const newChannel: Channel = {
      id: Date.now().toString(),
      name,
      profilePicture: profilePicture || DEFAULT_PROFILE_PICTURE,
      subscribers: 0,
      views: 0,
      money: 0,
      watchHours: 0,
      videos: [],
      equipment: { camera: 1, microphone: 1, editingSoftware: 1, decoration: 1 },
      energy: INITIAL_MAX_ENERGY,
      maxEnergy: INITIAL_MAX_ENERGY,
      isMonetized: false,
      creationDate: Date.now(),
      day: 1,
      totalEarnings: 0,
      achievements: [],
      premiumFollowingProject: isPremiumUser,
      pendingCommunityBoost: 0,
      lastCommunityGamePlayedDay: 0,
      pendingThumbnailCTRBoost: 0,
      lastThumbnailGamePlayedDay: 0,
      pendingStreamBonus: undefined, // Initialize new field
      lastStreamGamePlayedDay: 0,  // Initialize new field
    };
    const updatedChannels = [...channels, newChannel];
    setChannels(updatedChannels);
    setActiveChannelId(newChannel.id);
    saveChannels(updatedChannels, newChannel.id);
    setShowCreateChannel(false);
    
    // Update global stats
    const currentGlobalStats = JSON.parse(localStorage.getItem('youtubeGlobalStats_v2') || '{}') as Partial<GlobalStats>;
    saveGlobalStats({
        totalChannelsCreated: (currentGlobalStats.totalChannelsCreated || 0) + 1,
        totalSubscribers: currentGlobalStats.totalSubscribers || 0,
        totalViews: currentGlobalStats.totalViews || 0,
        totalMoneyEarned: currentGlobalStats.totalMoneyEarned || 0,
    });

    setTimeout(() => setIsLoading(false), 500); // Simulate loading
  };

  const handleChannelSelect = (id: string) => {
    if (activeChannelId === id) return;
    const selectedChannel = channels.find(c => c.id === id);
    if (selectedChannel && selectedChannel.premiumFollowingProject && !isPremiumUser && channels.indexOf(selectedChannel) >= MAX_CHANNELS) {
         alert("Este canal requiere Premium. Por favor, sigue a @project para desbloquearlo o elimina otro canal.");
         return;
    }

    setIsLoading(true);
    setActiveChannelId(id);
    localStorage.setItem('lastActiveChannelId_v2', id);
    setShowCreateChannel(false);
    setTimeout(() => setIsLoading(false), 500); // Simulate loading
  };

  const handleUpdateChannel = (updatedChannel: Channel) => {
    const updatedChannels = channels.map(c => c.id === updatedChannel.id ? updatedChannel : c);
    setChannels(updatedChannels);
    saveChannels(updatedChannels);
  };

  const handleDeleteChannel = (id: string) => {
    const channelToDelete = channels.find(c => c.id === id);
    if (!channelToDelete) return;

    setConfirmModalProps({
        title: `Eliminar Canal "${channelToDelete.name}"`,
        message: "¿Estás seguro de que quieres eliminar este canal? Esta acción no se puede deshacer.",
        onConfirm: () => {
            setIsLoading(true);
            const remainingChannels = channels.filter(c => c.id !== id);
            setChannels(remainingChannels);
            saveChannels(remainingChannels);
            if (activeChannelId === id) {
                if (remainingChannels.length > 0) {
                    setActiveChannelId(remainingChannels[0].id);
                    localStorage.setItem('lastActiveChannelId_v2', remainingChannels[0].id);
                } else {
                    setActiveChannelId(null);
                    localStorage.removeItem('lastActiveChannelId_v2');
                    setShowCreateChannel(true);
                }
            }
            setShowConfirmModal(false);
            setConfirmModalProps(null);
            setTimeout(() => setIsLoading(false), 300);
        }
    });
    setShowConfirmModal(true);
  };

  const handleCloseNewGamePopup = () => {
    setShowNewGamePopup(false);
    localStorage.setItem('hasSeenNewGamePopup', 'true');
  };
  
  const openDevAccount = () => {
    const devChannel: Channel = {
        id: 'dev-account',
        name: 'Cuenta de Desarrollador',
        profilePicture: DEFAULT_PROFILE_PICTURE,
        subscribers: 1000000,
        views: 50000000,
        money: 100000,
        watchHours: 200000,
        videos: Array.from({ length: 20 }).map((_, i) => ({
            id: `dev-video-${i}`,
            title: `Video de Prueba ${i + 1}`,
            genre: 'Gaming',
            subGenre: 'Minecraft',
            recordingMethod: 'Profesional (Alta Calidad)',
            uploadDate: Date.now() - (i * 24 * 60 * 60 * 1000),
            views: Math.floor(Math.random() * 1000000) + 50000,
            subscribersGained: Math.floor(Math.random() * 1000) + 50,
            moneyGained: Math.floor(Math.random() * 2000) + 100,
            watchHoursGained: Math.floor(Math.random() * 5000) + 200,
        })),
        equipment: { camera: 5, microphone: 5, editingSoftware: 5, decoration: 5 },
        energy: 200,
        maxEnergy: 200,
        isMonetized: true,
        creationDate: Date.now(),
        day: 100,
        totalEarnings: 50000,
        achievements: ['subs_1000000', 'views_1000000', 'watch_1000', 'videos_10', 'money_10000'],
        premiumFollowingProject: true,
        pendingCommunityBoost: 0,
        lastCommunityGamePlayedDay: 0,
        pendingThumbnailCTRBoost: 0,
        lastThumbnailGamePlayedDay: 0,
        pendingStreamBonus: undefined,
        lastStreamGamePlayedDay: 0,
    };
    
    // Temporarily add to channels list for UI, but don't save it
    const tempChannels = [devChannel, ...channels.filter(c => c.id !== 'dev-account')];
    setChannels(tempChannels); // Update state to include dev channel for selection
    setActiveChannelId('dev-account');
    setShowCreateChannel(false);
    // Note: We are not calling saveChannels here to keep it ephemeral.
  };


  if (isFullScreenLogo) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-white dark:bg-gray-900">
        <div className="flex items-center text-red-600 dark:text-red-500 mb-2">
          <i className="fab fa-youtube text-6xl md:text-8xl"></i>
          <h1 className="ml-3 md:ml-4 text-4xl md:text-6xl font-bold">YouTube</h1>
        </div>
        <p className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300">Studio Simulator</p>
         <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Modo Miniatura Activo</p>
      </div>
    );
  }

  if (isLoading && !activeChannelId && !showCreateChannel) {
    return <LoadingScreen text="Cargando Simulador..." />;
  }
  
  const currentChannel = channels.find(c => c.id === activeChannelId);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`app-container min-h-screen ${theme}`}>
        {showNewGamePopup && <NewGamePopup onClose={handleCloseNewGamePopup} />}
        {showConfirmModal && confirmModalProps && (
          <ConfirmModal
            title={confirmModalProps.title}
            message={confirmModalProps.message}
            onConfirm={confirmModalProps.onConfirm}
            onCancel={() => {
                setShowConfirmModal(false);
                setConfirmModalProps(null);
            }}
          />
        )}

        {showCreateChannel || !currentChannel ? (
          <CreateChannelScreen
            onCreateChannel={handleCreateChannel}
            existingChannels={channels}
            onSelectChannel={handleChannelSelect}
            onDeleteChannel={handleDeleteChannel}
            maxChannels={isPremiumUser ? MAX_CHANNELS_PREMIUM : MAX_CHANNELS}
            isPremiumUser={isPremiumUser}
            globalStats={globalStats}
            isDevUser={isDevUser}
            onOpenDevAccount={openDevAccount}
          />
        ) : (
          <GameLayout
            channel={currentChannel}
            onUpdateChannel={handleUpdateChannel}
            onSwitchChannel={() => {
              setActiveChannelId(null);
              setShowCreateChannel(true);
            }}
            allChannels={channels}
            onSelectChannel={handleChannelSelect}
            isLoading={isLoading}
            isPremiumUser={isPremiumUser}
            globalStats={globalStats}
            isDevUser={isDevUser}
            onOpenDevAccount={openDevAccount}
          />
        )}
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
