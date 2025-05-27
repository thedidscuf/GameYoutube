import React, { useState, useMemo, useContext } from 'react';
import { Channel, Video } from '../types';
import { ThemeContext } from '../App'; // Import ThemeContext

type SortKey = 'uploadDate' | 'views' | 'title';
type SortOrder = 'asc' | 'desc';

// Function to generate video thumbnails as SVG data URLs
const getVideoThumbnail = (video: Video, theme: 'light' | 'dark'): string => {
  // Consistent base genre colors, text/icon colors will ensure contrast
  const genreColorsBase: { [key: string]: string } = {
    Gaming: '#4A5568', Música: '#7B341E', Vlogs: '#2C5282', Educación: '#276749',
    Comedia: '#B83280', Tecnología: '#1A202C', Belleza: '#702459', Cocina: '#C05621', Default: '#667EEA'
  };
   // Light theme might use slightly darker/saturated versions of base for more pop
  const genreColorsLight: { [key: string]: string } = {
    Gaming: '#3E4C59', Música: '#9C4223', Vlogs: '#254E70', Educación: '#1F5F34',
    Comedia: '#A32977', Tecnología: '#111827', Belleza: '#611F4E', Cocina: '#B54D1B', Default: '#5A67D8'
  };

  // Dark theme uses lighter/brighter versions of base
  const genreColorsDark: { [key: string]: string } = {
    Gaming: '#718096', Música: '#F56565', Vlogs: '#63B3ED', Educación: '#68D391',
    Comedia: '#F687B3', Tecnología: '#A0AEC0', Belleza: '#B794F4', Cocina: '#F6AD55', Default: '#7F9CF5'
  };


  const currentGenreColors = theme === 'dark' ? genreColorsDark : genreColorsLight;
  const bgColor = currentGenreColors[video.genre] || (theme === 'dark' ? genreColorsDark.Default : genreColorsLight.Default);
  
  // Text and icon colors with high contrast based on theme
  const genreTextColor = theme === 'dark' ? '#0D101B' : '#FFFFFF'; // Dark text on light bg / White text on dark bg for genre
  const titleTextColor = theme === 'dark' ? '#1A202C' : '#F0F0F0'; // Slightly less prominent for title
  
  const playButtonBgColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.4)';
  const playButtonIconColor = theme === 'dark' ? '#1A202C' : '#FFFFFF';


  const titleWords = video.title.split(' ');
  const line1 = titleWords.slice(0, 3).join(' ');
  const line2 = titleWords.slice(3, 6).join(' ');

  // Minified SVG to reduce data URL length
  const svgContent = `<svg width="160" height="90" viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg" style="font-family: Inter, sans-serif;">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <text x="8" y="18" font-size="11px" font-weight="bold" fill="${genreTextColor}" text-anchor="start">${video.genre.toUpperCase()}</text>
    <text x="8" y="36" font-size="10px" font-weight="500" fill="${titleTextColor}" text-anchor="start">${line1}</text>
    <text x="8" y="51" font-size="10px" font-weight="500" fill="${titleTextColor}" text-anchor="start">${line2}</text>
    <g transform="translate(128, 63)"> <!-- Positioned bottom right -->
      <circle cx="10" cy="10" r="10" fill="${playButtonBgColor}"/>
      <path d="M 7.5 5 L 7.5 15 L 14.5 10 Z" fill="${playButtonIconColor}"/>
    </g>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
};


const ContentPage: React.FC<{ channel: Channel, onUpdateChannel: (channel: Channel) => void }> = ({ channel, onUpdateChannel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('uploadDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const { theme } = useContext(ThemeContext); // Get current theme

  const filteredAndSortedVideos = useMemo(() => {
    return channel.videos
      .filter(video => video.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        let comparison = 0;
        if (sortKey === 'title') {
          comparison = a.title.localeCompare(b.title);
        } else {
          // For 'uploadDate' and 'views', which are numbers
          if (a[sortKey] < b[sortKey]) {
            comparison = -1;
          } else if (a[sortKey] > b[sortKey]) {
            comparison = 1;
          }
        }
        return sortOrder === 'desc' ? comparison * -1 : comparison;
      });
  }, [channel.videos, searchTerm, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc'); // Default to descending for a new sort key
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <i className="fas fa-sort opacity-50 ml-1"></i>;
    if (sortOrder === 'desc') return <i className="fas fa-sort-down ml-1"></i>;
    return <i className="fas fa-sort-up ml-1"></i>;
  };

  const formatDate = (timestamp: number) => {
    // Calculate day relative to channel creation and current day
    const videoCreationDay = Math.floor((timestamp - channel.creationDate) / (24 * 60 * 60 * 1000)) + 1;
    return `Día ${Math.max(1, videoCreationDay)}`; 
  };
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K'; // No decimal for K to save space
    return num.toString();
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Contenido del Canal</h1>
      
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <input
            type="text"
            placeholder="Buscar videos por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:flex-grow px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
           <button 
            onClick={() => onUpdateChannel(channel)} // This typically re-renders with current channel state
            className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-5 rounded-lg text-sm transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
           >
            <i className="fas fa-sync-alt mr-2"></i>Refrescar
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6 items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Ordenar por:</span>
            {(['uploadDate', 'views', 'title'] as SortKey[]).map(key => (
                <button
                key={key}
                onClick={() => handleSort(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center
                            ${sortKey === key ? 'bg-red-500 text-white dark:bg-red-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                {key === 'uploadDate' ? 'Fecha' : key === 'title' ? 'Título' : 'Vistas'}
                {getSortIcon(key)}
                </button>
            ))}
        </div>

        {filteredAndSortedVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {filteredAndSortedVideos.map((video) => (
              <div key={video.id} className="bg-gray-50 dark:bg-slate-700 rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl hover:scale-[1.02]">
                <img 
                  src={getVideoThumbnail(video, theme)} 
                  alt={`Miniatura de ${video.title}`} 
                  className="w-full h-36 object-cover bg-gray-300 dark:bg-gray-600" // aspect-video would be h-auto
                />
                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1 truncate" title={video.title}>
                    {video.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {video.genre}{video.subGenre ? ` - ${video.subGenre.substring(0,10)}${video.subGenre.length > 10 ? '...' : ''}` : ''} &bull; {formatDate(video.uploadDate)}
                  </p>
                  <div className="mt-auto space-y-1.5 text-xs">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <i className="fas fa-eye mr-1.5 text-blue-500 dark:text-blue-400 w-4 text-center"></i> Vistas: {formatNumber(video.views)}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <i className="fas fa-users mr-1.5 text-red-500 dark:text-red-400 w-4 text-center"></i> Subs: +{formatNumber(video.subscribersGained)}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <i className="fas fa-dollar-sign mr-1.5 text-green-500 dark:text-green-400 w-4 text-center"></i> Ganancias: ${video.moneyGained.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-video-slash text-5xl text-gray-400 dark:text-gray-500 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No se encontraron videos que coincidan con tu búsqueda.' : 'Aún no has subido ningún video. ¡Empieza a crear!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPage;