
import React, { useState, useEffect } from 'react';
import { Channel, Video, EquipmentType, PremiumBenefits, StreamBonus } from '../types';
import { 
    ENERGY_PER_VIDEO, 
    MONEY_PER_1000_VIEWS_MONETIZED, 
    WATCH_HOURS_PER_VIEW_MINUTE_AVG, 
    EQUIPMENT_DATA, 
    PREMIUM_BENEFITS_DETAILS, 
    ADVANCED_GENRES, 
    VIDEO_GENRES, 
    RECORDING_METHODS, 
    MONETIZATION_REQUIREMENTS 
} from '../constants';
import Tooltip from './Tooltip';

interface UploadVideoModalProps {
  onClose: () => void;
  onUpload: (video: Video) => void;
  channel: Channel;
  onUpdateChannel: (updatedChannel: Channel) => void;
  setUploadProgress: (progress: number | null) => void;
}

const UploadVideoModal: React.FC<UploadVideoModalProps> = ({ onClose, onUpload, channel, onUpdateChannel, setUploadProgress }) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<string>(VIDEO_GENRES[0]);
  const [subGenre, setSubGenre] = useState<string>('');
  const [recordingMethod, setRecordingMethod] = useState<string>(RECORDING_METHODS[0]);
  const [error, setError] = useState<string>('');

  const availableSubGenres = ADVANCED_GENRES[genre] || [];

  useEffect(() => {
    if (availableSubGenres.length > 0) {
      setSubGenre(availableSubGenres[0]);
    } else {
      setSubGenre('');
    }
  }, [genre, availableSubGenres]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const energyCost = ENERGY_PER_VIDEO * (channel.premiumFollowingProject && PREMIUM_BENEFITS_DETAILS.reducedEnergyCosts ? 0.8 : 1);

    if (channel.energy < energyCost) {
      setError(`No tienes suficiente energía. Necesitas ${energyCost}, tienes ${channel.energy}.`);
      return;
    }
    if (!title.trim()) {
      setError('El título del video no puede estar vacío.');
      return;
    }
    if (!genre) {
      setError('Debes seleccionar un género.');
      return;
    }
    if (availableSubGenres.length > 0 && !subGenre) {
        setError('Debes seleccionar un subgénero.');
        return;
    }

    setUploadProgress(0); 

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress <= 100) {
        setUploadProgress(currentProgress);
      } else {
        clearInterval(progressInterval);
        setUploadProgress(null); 

        // --- Base Calculations ---
        let calculatedViews = 50 + Math.floor(Math.random() * (channel.subscribers * 0.1 + 100));
        
        const qualityMultiplier = 
          (EQUIPMENT_DATA[EquipmentType.CAMERA].levels[channel.equipment.camera -1].statBoost || 0) +
          (EQUIPMENT_DATA[EquipmentType.MICROPHONE].levels[channel.equipment.microphone -1].statBoost || 0) +
          (EQUIPMENT_DATA[EquipmentType.EDITING_SOFTWARE].levels[channel.equipment.editingSoftware -1].statBoost || 0);
        
        let methodMultiplier = 1;
        if (recordingMethod === RECORDING_METHODS[1]) methodMultiplier = 1.2;
        if (recordingMethod === RECORDING_METHODS[2]) methodMultiplier = 1.5;

        const premiumViewsMultiplier = channel.premiumFollowingProject ? PREMIUM_BENEFITS_DETAILS.viewsMultiplier : 1;
        
        const isViral = Math.random() < 0.05;
        const viralMultiplier = isViral ? (Math.random() * 3 + 2) : 1;

        // FIX: Cannot find name 'baseViews'. Replaced with calculatedViews as it holds the base value.
        calculatedViews = Math.floor(calculatedViews * (1 + qualityMultiplier) * methodMultiplier * premiumViewsMultiplier * viralMultiplier);
        
        // --- Apply Thumbnail CTR Boost ---
        let thumbnailBoostApplied = false;
        if (channel.pendingThumbnailCTRBoost && channel.pendingThumbnailCTRBoost > 0) {
            calculatedViews = Math.floor(calculatedViews * (1 + channel.pendingThumbnailCTRBoost));
            thumbnailBoostApplied = true;
        }
        
        calculatedViews = Math.max(calculatedViews, Math.floor(Math.random() * 50) + 10); // Ensure minimum views

        // --- Calculate Subscribers Gained (based on potentially CTR-boosted views) ---
        let subscribersGained = Math.floor(calculatedViews * (0.005 + Math.random() * 0.01) * (1 + qualityMultiplier * 0.5));
        
        // --- Apply Community Boost ---
        let communityBoostApplied = false;
        if (channel.pendingCommunityBoost && channel.pendingCommunityBoost > 0) {
            const communityBoostFactor = 1 + (channel.pendingCommunityBoost * 0.001); // 0.1% per point
            calculatedViews = Math.floor(calculatedViews * communityBoostFactor);
            subscribersGained = Math.floor(subscribersGained * communityBoostFactor);
            communityBoostApplied = true;
        }

        // --- Calculate Watch Hours (based on final views before stream bonus) ---
        const watchHoursGained = parseFloat((calculatedViews * WATCH_HOURS_PER_VIEW_MINUTE_AVG * (1 + (EQUIPMENT_DATA[EquipmentType.EDITING_SOFTWARE].levels[channel.equipment.editingSoftware-1].statBoost || 0) * 0.5)).toFixed(2));
        
        // --- Calculate Money Gained (base, before stream bonus) ---
        let moneyGained = 0;
        if (channel.isMonetized) {
          const premiumEarningsMultiplier = channel.premiumFollowingProject ? PREMIUM_BENEFITS_DETAILS.earningsMultiplier : 1;
          moneyGained = parseFloat(((calculatedViews / 1000) * MONEY_PER_1000_VIEWS_MONETIZED * premiumEarningsMultiplier).toFixed(2));
        }

        // --- Apply Stream Bonus ---
        let streamBonusApplied = false;
        if (channel.pendingStreamBonus) {
            calculatedViews = Math.floor(calculatedViews * channel.pendingStreamBonus.viewsMultiplier);
            subscribersGained = Math.floor(subscribersGained * channel.pendingStreamBonus.subsMultiplier);
            if (channel.isMonetized) { // Money bonus only if monetized
                 moneyGained = parseFloat((moneyGained * channel.pendingStreamBonus.moneyMultiplier).toFixed(2));
            }
            streamBonusApplied = true;
        }

        const newVideo: Video = {
          id: Date.now().toString(),
          title,
          genre,
          subGenre: availableSubGenres.length > 0 ? subGenre : undefined,
          recordingMethod,
          uploadDate: Date.now(), 
          views: calculatedViews,
          subscribersGained,
          moneyGained,
          watchHoursGained, // Watch hours generally not affected by late-stage multipliers like stream bonus in this model
        };

        onUpload(newVideo);

        const updatedChannel: Channel = {
          ...channel,
          energy: channel.energy - energyCost,
          subscribers: channel.subscribers + subscribersGained,
          views: channel.views + calculatedViews,
          money: channel.money + moneyGained,
          watchHours: parseFloat((channel.watchHours + watchHoursGained).toFixed(2)),
          totalEarnings: channel.totalEarnings + moneyGained,
          videos: [newVideo, ...channel.videos],
          achievements: [...channel.achievements],
          pendingCommunityBoost: communityBoostApplied ? 0 : channel.pendingCommunityBoost,
          pendingThumbnailCTRBoost: thumbnailBoostApplied ? 0 : channel.pendingThumbnailCTRBoost,
          pendingStreamBonus: streamBonusApplied ? undefined : channel.pendingStreamBonus,
        };

        if (!updatedChannel.isMonetized && updatedChannel.subscribers >= MONETIZATION_REQUIREMENTS.subscribers && updatedChannel.watchHours >= MONETIZATION_REQUIREMENTS.watchHours) {
            updatedChannel.isMonetized = true;
        }

        onUpdateChannel(updatedChannel);
        onClose();
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Subir Nuevo Contenido</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-2xl">
            &times;
          </button>
        </div>

        {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4 bg-red-100 dark:bg-red-900 p-3 rounded-md">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="videoTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Introduce un título atractivo"
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label htmlFor="videoGenre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Género <span className="text-red-500">*</span>
            </label>
            <select
              id="videoGenre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              {VIDEO_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {availableSubGenres.length > 0 && (
            <div>
              <label htmlFor="videoSubGenre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subgénero <span className="text-red-500">*</span>
              </label>
              <select
                id="videoSubGenre"
                value={subGenre}
                onChange={(e) => setSubGenre(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                {availableSubGenres.map(sg => <option key={sg} value={sg}>{sg}</option>)}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="recordingMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Método de Grabación <span className="text-red-500">*</span>
            </label>
            <select
              id="recordingMethod"
              value={recordingMethod}
              onChange={(e) => setRecordingMethod(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              {RECORDING_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          
          <div className="pt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <Tooltip text={`Costo base: ${ENERGY_PER_VIDEO}. ${channel.premiumFollowingProject && PREMIUM_BENEFITS_DETAILS.reducedEnergyCosts ? `Costo reducido por Premium: ${ENERGY_PER_VIDEO * 0.8}` : ''}`}>
                <p><i className="fas fa-bolt mr-1"></i> Costo de energía: {ENERGY_PER_VIDEO * (channel.premiumFollowingProject && PREMIUM_BENEFITS_DETAILS.reducedEnergyCosts ? 0.8 : 1)} (Tienes: {channel.energy})</p>
            </Tooltip>
            {channel.pendingCommunityBoost && channel.pendingCommunityBoost > 0 && (
                <p className="text-blue-500 dark:text-blue-400"><i className="fas fa-comments mr-1"></i>¡Boost de comunidad activo (+{channel.pendingCommunityBoost} pts)!</p>
            )}
            {channel.pendingThumbnailCTRBoost && channel.pendingThumbnailCTRBoost > 0 && (
                <p className="text-purple-500 dark:text-purple-400"><i className="fas fa-magic mr-1"></i>¡Boost de CTR de miniatura activo (+{(channel.pendingThumbnailCTRBoost * 100).toFixed(1)}%)!</p>
            )}
            {channel.pendingStreamBonus && (
                <p className="text-teal-500 dark:text-teal-400"><i className="fas fa-broadcast-tower mr-1"></i>¡Bonus de Stream activo (Vistas x{channel.pendingStreamBonus.viewsMultiplier.toFixed(2)}, Subs x{channel.pendingStreamBonus.subsMultiplier.toFixed(2)})!</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row-reverse sm:space-x-reverse sm:space-x-3 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              <i className="fas fa-cloud-upload-alt mr-2"></i>Iniciar Subida
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto mt-3 sm:mt-0 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold py-2.5 px-6 rounded-md shadow-md transition duration-150 ease-in-out"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadVideoModal;