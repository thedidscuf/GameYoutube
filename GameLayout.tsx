
import React, { useState, useEffect, useContext } from 'react';
import { Channel, GlobalStats, Video } from '../types';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardPage from '../pages/DashboardPage.tsx';
import ContentPage from '../pages/ContentPage.tsx';
import MonetizationPage from '../pages/MonetizationPage.tsx';
import CustomizationPage from '../pages/CustomizationPage.tsx';
import EquipmentPage from '../pages/EquipmentPage.tsx';
import AchievementsPage from '../pages/AchievementsPage.tsx';
import CommunityPage from '../pages/CommunityPage.tsx';
import ThumbnailOptimizerPage from '../pages/ThumbnailOptimizerPage.tsx';
import StreamerSensationPage from '../pages/StreamerSensationPage.tsx'; // Import StreamerSensationPage
import UploadVideoModal from '../components/UploadVideoModal';
import LoadingScreen from '../components/LoadingScreen';
import { ThemeContext } from '../App';
import UploadProgressToast from '../components/UploadProgressToast';

type Page = 'dashboard' | 'content' | 'monetization' | 'customization' | 'equipment' | 'achievements' | 'community' | 'optimization' | 'live'; // Add 'live'

interface GameLayoutProps {
  channel: Channel;
  onUpdateChannel: (updatedChannel: Channel) => void;
  onSwitchChannel: () => void;
  allChannels: Channel[];
  onSelectChannel: (id: string) => void;
  isLoading: boolean;
  isPremiumUser: boolean;
  globalStats: GlobalStats;
  isDevUser: boolean;
  onOpenDevAccount: () => void;
}

const GameLayout: React.FC<GameLayoutProps> = ({
  channel,
  onUpdateChannel,
  onSwitchChannel,
  allChannels,
  onSelectChannel,
  isLoading,
  isPremiumUser,
  globalStats,
  isDevUser,
  onOpenDevAccount
}) => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { theme } = useContext(ThemeContext);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);


  useEffect(() => {
    // Auto-close sidebar on small screens initially
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleVideoUpload = (video: Video) => {
    const newChannelData = { ...channel, videos: [video, ...channel.videos] };
    onUpdateChannel(newChannelData);
  };

  const renderPage = () => {
    if (isLoading && channel.id !== 'dev-account') { // Dev account might not need full loading screen logic always
        return <LoadingScreen text={`Cargando canal ${channel.name}...`} />;
    }
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage channel={channel} onUpdateChannel={onUpdateChannel} />;
      case 'content':
        return <ContentPage channel={channel} onUpdateChannel={onUpdateChannel} />;
      case 'monetization':
        return <MonetizationPage channel={channel} onUpdateChannel={onUpdateChannel} />;
      case 'customization':
        return <CustomizationPage channel={channel} onUpdateChannel={onUpdateChannel} />;
      case 'equipment':
        return <EquipmentPage channel={channel} onUpdateChannel={onUpdateChannel} />;
      case 'achievements':
        return <AchievementsPage channel={channel} />;
      case 'community':
        return <CommunityPage channel={channel} onUpdateChannel={onUpdateChannel} />;
      case 'optimization':
        return <ThumbnailOptimizerPage channel={channel} onUpdateChannel={onUpdateChannel} />;
      case 'live': // Add case for StreamerSensationPage
        return <StreamerSensationPage channel={channel} onUpdateChannel={onUpdateChannel} />;
      default:
        return <DashboardPage channel={channel} onUpdateChannel={onUpdateChannel} />;
    }
  };

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 ${theme}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        currentPage={currentPage}
        onSetPage={setCurrentPage}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          channelName={channel.name}
          profilePicture={channel.profilePicture}
          money={channel.money}
          onSwitchChannel={onSwitchChannel}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onUploadVideo={() => setShowUploadModal(true)}
          currentChannelId={channel.id}
          allChannels={allChannels}
          onSelectChannel={onSelectChannel}
          isPremiumUser={isPremiumUser}
          channel={channel}
          onUpdateChannel={onUpdateChannel}
          globalStats={globalStats}
          isDevUser={isDevUser}
          onOpenDevAccount={onOpenDevAccount}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900">
          {renderPage()}
        </main>
      </div>
      {showUploadModal && (
        <UploadVideoModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleVideoUpload}
          channel={channel}
          onUpdateChannel={onUpdateChannel}
          setUploadProgress={setUploadProgress}
        />
      )}
      {uploadProgress !== null && (
        <UploadProgressToast progress={uploadProgress} onClose={() => setUploadProgress(null)} />
      )}
    </div>
  );
};

export default GameLayout;
