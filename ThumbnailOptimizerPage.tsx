
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Channel, ThumbnailComponent, ThumbnailComponentType, ThumbnailVisual } from '../types';
import { 
    THUMBNAIL_OPTIMIZER_ENERGY_COST, 
    THUMBNAIL_GAME_DURATION_SECONDS, 
    MAX_THUMBNAIL_POINTS, 
    MAX_CTR_BOOST_PERCENTAGE, 
    PREDEFINED_THUMBNAIL_COMPONENTS 
} from '../constants';
import Tooltip from '../components/Tooltip';

// Helper to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface ThumbnailOptimizerPageProps {
  channel: Channel;
  onUpdateChannel: (updatedChannel: Channel) => void;
}

type GamePhase = 'idle' | 'playing' | 'finished';
type SelectedComponents = {
  background: ThumbnailComponent | null;
  object: ThumbnailComponent | null;
  text: ThumbnailComponent | null;
};

// Component to display the thumbnail canvas
const ThumbnailCanvasDisplay: React.FC<{ components: SelectedComponents }> = ({ components }) => {
  const backgroundStyle: React.CSSProperties = {};
  if (components.background) {
    const visual = components.background.visual;
    if (visual.type === 'color') backgroundStyle.backgroundColor = visual.value;
    if (visual.type === 'gradient') backgroundStyle.backgroundImage = visual.value;
  }

  return (
    <div 
        className="w-full aspect-[16/9] bg-gray-300 dark:bg-gray-700 rounded-md shadow-inner relative overflow-hidden border-2 border-gray-400 dark:border-gray-600" 
        style={backgroundStyle}
        aria-label="Previsualización de Miniatura"
    >
      {components.object && components.object.visual.type === 'icon' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <i 
            className={`${components.object.visual.iconClass} opacity-80`}
            style={{ 
                color: components.object.visual.color, 
                fontSize: components.object.visual.size || '4rem',
                textShadow: '0 0 5px rgba(0,0,0,0.3)'
            }}
            aria-hidden="true"
          ></i>
        </div>
      )}
      {components.text && components.text.visual.type === 'text' && (
         <div className="absolute bottom-2 left-2 right-2 p-1 md:bottom-3 md:left-3 md:right-3 md:p-2 bg-black bg-opacity-20 rounded">
            <p
                style={{
                fontFamily: components.text.visual.fontFamily,
                fontSize: components.text.visual.fontSize,
                color: components.text.visual.color,
                textAlign: 'center',
                fontWeight: 'bold',
                WebkitTextStroke: components.text.visual.strokeWidth && components.text.visual.strokeColor ? `${components.text.visual.strokeWidth} ${components.text.visual.strokeColor}` : undefined,
                paintOrder: 'stroke fill', // Ensures stroke is behind fill for better readability
                lineHeight: 1.1
                }}
                className="truncate"
            >
                {components.text.visual.content}
            </p>
         </div>
      )}
       {!components.background && !components.object && !components.text && (
        <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Elige componentes...</p>
        </div>
        )}
    </div>
  );
};

// Component for an item in the reel
const ComponentReelItem: React.FC<{ component: ThumbnailComponent, onClick: () => void, isSelected?: boolean }> = ({ component, onClick, isSelected }) => {
    let displayContent;
    const itemStyle: React.CSSProperties = {
        width: '100px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid transparent', borderRadius: '4px', cursor: 'pointer',
        textAlign: 'center', fontSize: '0.7rem', padding: '2px', overflow: 'hidden'
    };

    if (component.visual.type === 'color') {
        itemStyle.backgroundColor = component.visual.value;
    } else if (component.visual.type === 'gradient') {
        itemStyle.backgroundImage = component.visual.value;
    } else if (component.visual.type === 'icon') {
        displayContent = <i className={`${component.visual.iconClass} text-2xl`} style={{ color: component.visual.color }}></i>;
        itemStyle.backgroundColor = component.visual.backgroundColor || '#e0e0e0';
    } else if (component.visual.type === 'text') {
        displayContent = <span style={{ fontFamily: component.visual.fontFamily, color: component.visual.color, fontSize: '0.8rem', WebkitTextStroke: component.visual.strokeWidth && component.visual.strokeColor ? `${component.visual.strokeWidth} ${component.visual.strokeColor}` : undefined }}>{component.visual.content.substring(0,10)}{component.visual.content.length > 10 ? '...' : ''}</span>;
        itemStyle.backgroundColor = '#f0f0f0';
    }
    
    return (
        <Tooltip text={`${component.displayName} (${component.points > 0 ? '+' : ''}${component.points} pts)`}>
            <button 
                onClick={onClick}
                style={itemStyle}
                className={`m-1 transition-all duration-150 ${isSelected ? 'ring-2 ring-red-500 opacity-50' : 'hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400'}`}
                aria-label={`Seleccionar ${component.displayName}`}
            >
                {displayContent || component.displayName.substring(0,15)}
            </button>
        </Tooltip>
    );
}

const ThumbnailOptimizerPage: React.FC<ThumbnailOptimizerPageProps> = ({ channel, onUpdateChannel }) => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle');
  const [timeLeft, setTimeLeft] = useState(THUMBNAIL_GAME_DURATION_SECONDS);
  const [currentScore, setCurrentScore] = useState(0);
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponents>({ background: null, object: null, text: null });
  const [reel, setReel] = useState<ThumbnailComponent[]>([]);
  const [canPlayToday, setCanPlayToday] = useState(true);
  const [finalBoost, setFinalBoost] = useState(0);
  
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);


  useEffect(() => {
    if (channel.lastThumbnailGamePlayedDay === channel.day) {
      setCanPlayToday(false);
    } else {
      setCanPlayToday(true);
    }
  }, [channel.day, channel.lastThumbnailGamePlayedDay]);

  const componentsByType = useMemo(() => {
    return PREDEFINED_THUMBNAIL_COMPONENTS.reduce((acc, comp) => {
        if (!acc[comp.componentType]) acc[comp.componentType] = [];
        acc[comp.componentType].push(comp);
        return acc;
    }, {} as Record<ThumbnailComponentType, ThumbnailComponent[]>);
  }, []);

  const updateReel = useCallback(() => {
    const newReelItems: ThumbnailComponent[] = [];
    const types: ThumbnailComponentType[] = ['background', 'object', 'text'];
    
    types.forEach(type => {
        const availableForType = componentsByType[type] || [];
        if(availableForType.length > 0) {
            // Add 1-2 items of each type to the reel, try to avoid already selected if possible
            const count = Math.random() > 0.5 ? 2: 1;
            for(let i=0; i < count; i++){
                let randomComponent = availableForType[Math.floor(Math.random() * availableForType.length)];
                // Basic attempt to not show exact same selected one again immediately
                if(selectedComponents[type]?.id === randomComponent.id && availableForType.length > 1){
                    randomComponent = availableForType[Math.floor(Math.random() * availableForType.length)];
                }
                newReelItems.push(randomComponent);
            }
        }
    });
    setReel(shuffleArray(newReelItems).slice(0, 5)); // Show up to 5 items in the reel
  }, [componentsByType, selectedComponents]);


  useEffect(() => {
    let timerId: NodeJS.Timeout;
    let reelIntervalId: NodeJS.Timeout;

    if (gamePhase === 'playing') {
      updateReel(); // Initial reel
      timerId = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            clearInterval(reelIntervalId);
            setGamePhase('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      reelIntervalId = setInterval(updateReel, 3000); // Refresh reel every 3 seconds
    }
    return () => {
      clearInterval(timerId);
      clearInterval(reelIntervalId);
    };
  }, [gamePhase, updateReel]);
  
  useEffect(() => {
    if (gamePhase === 'finished') {
      const boostFactor = (currentScore / MAX_THUMBNAIL_POINTS) * MAX_CTR_BOOST_PERCENTAGE;
      const finalBoostPercentage = Math.max(0, Math.min(boostFactor, MAX_CTR_BOOST_PERCENTAGE));
      setFinalBoost(finalBoostPercentage);
      onUpdateChannel({ 
          ...channel, 
          pendingThumbnailCTRBoost: (channel.pendingThumbnailCTRBoost || 0) + finalBoostPercentage,
      });
       setFeedbackMessage({ text: `¡Juego terminado! Puntuación: ${currentScore}. Boost de CTR para el próximo video: ${(finalBoostPercentage * 100).toFixed(1)}%.`, type: 'success' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase]); // Only run when gamePhase changes to 'finished'


  const startGame = () => {
    if (!canPlayToday) {
      setFeedbackMessage({ text: 'Ya has optimizado una miniatura hoy. ¡Vuelve mañana!', type: 'info' });
      return;
    }
    if (channel.energy < THUMBNAIL_OPTIMIZER_ENERGY_COST) {
      setFeedbackMessage({ text: `No tienes suficiente energía. Necesitas ${THUMBNAIL_OPTIMIZER_ENERGY_COST}.`, type: 'error' });
      return;
    }

    onUpdateChannel({ 
        ...channel, 
        energy: channel.energy - THUMBNAIL_OPTIMIZER_ENERGY_COST,
        lastThumbnailGamePlayedDay: channel.day
    });
    setCanPlayToday(false);

    setSelectedComponents({ background: null, object: null, text: null });
    setCurrentScore(0);
    setTimeLeft(THUMBNAIL_GAME_DURATION_SECONDS);
    setGamePhase('playing');
    setFeedbackMessage(null);
  };

  const handleComponentSelect = (component: ThumbnailComponent) => {
    if (gamePhase !== 'playing') return;

    // Calculate score change
    let scoreChange = component.points;
    const oldComponent = selectedComponents[component.componentType];
    if (oldComponent) {
      scoreChange -= oldComponent.points; // Subtract old component's points
    }

    setSelectedComponents(prev => ({ ...prev, [component.componentType]: component }));
    setCurrentScore(prev => Math.max(0, Math.min(prev + scoreChange, MAX_THUMBNAIL_POINTS)));
    updateReel(); // Refresh reel after selection
  };
  
  const resetGame = () => {
    setGamePhase('idle');
    setFeedbackMessage(null);
    setCurrentScore(0);
    setFinalBoost(0);
     if (channel.lastThumbnailGamePlayedDay !== channel.day) { 
        setCanPlayToday(true);
    }
  };

  if (gamePhase === 'idle' || gamePhase === 'finished') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Optimizador de Miniaturas</h1>
        {feedbackMessage && (
            <div className={`p-3 rounded-md text-sm ${
                feedbackMessage.type === 'success' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 border-l-4 border-green-500' : 
                feedbackMessage.type === 'error' ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 border-l-4 border-red-500' :
                'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 border-l-4 border-blue-500'
            }`}>
            {feedbackMessage.text}
            </div>
        )}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
          <i className="fas fa-magic text-5xl text-purple-500 dark:text-purple-400 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Crea la Miniatura Perfecta</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Selecciona componentes para tu miniatura: Fondo, Objeto y Texto. <br/>
            Tienes {THUMBNAIL_GAME_DURATION_SECONDS} segundos para lograr la mejor puntuación.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Cuesta <strong className="text-yellow-500">{THUMBNAIL_OPTIMIZER_ENERGY_COST} de energía</strong> y puedes jugar una vez al día. <br/>
            Una buena miniatura puede mejorar el CTR de tu próximo video.
          </p>
          
          {gamePhase === 'idle' && (
            <Tooltip text={!canPlayToday ? "Ya jugaste hoy" : (channel.energy < THUMBNAIL_OPTIMIZER_ENERGY_COST ? `Necesitas ${THUMBNAIL_OPTIMIZER_ENERGY_COST} energía` : "Empezar juego")}>
                <button
                onClick={startGame}
                disabled={!canPlayToday || channel.energy < THUMBNAIL_OPTIMIZER_ENERGY_COST}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                <i className="fas fa-play mr-2"></i>Jugar ({THUMBNAIL_OPTIMIZER_ENERGY_COST} <i className="fas fa-bolt text-xs"></i>)
                </button>
            </Tooltip>
          )}
          {gamePhase === 'finished' && (
             <button
                onClick={resetGame}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
            >
                <i className="fas fa-redo mr-2"></i>Volver a Jugar (Mañana)
            </button>
          )}

          {/*
          FIX: Removed redundant `gamePhase !== 'playing'` check.
          The outer condition `gamePhase === 'idle' || gamePhase === 'finished'` already ensures this.
          */}
          {channel.pendingThumbnailCTRBoost && channel.pendingThumbnailCTRBoost > 0 && (
            <p className="text-sm text-purple-500 dark:text-purple-400 mt-4">
                <i className="fas fa-info-circle mr-1"></i>Tienes un boost de CTR de +{(channel.pendingThumbnailCTRBoost * 100).toFixed(1)}% pendiente para tu próximo video.
            </p>
          )}
        </div>
        {gamePhase === 'finished' && (
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg mt-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 text-center">Miniatura Creada:</h3>
                <div className="max-w-xs mx-auto">
                    <ThumbnailCanvasDisplay components={selectedComponents} />
                </div>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md sticky top-0 z-10">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Optimizador de Miniaturas</h1>
            <div className="flex items-center gap-3 md:gap-5 text-sm md:text-base">
                <div className="text-center">
                    <div className="font-semibold text-red-500 dark:text-red-400">Tiempo</div>
                    <div className="text-lg font-bold text-gray-700 dark:text-gray-200">{timeLeft}s</div>
                </div>
                <div className="text-center">
                    <div className="font-semibold text-blue-500 dark:text-blue-400">Puntuación</div>
                    <div className="text-lg font-bold text-gray-700 dark:text-gray-200">{currentScore}</div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl shadow-lg">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">Tu Miniatura</h2>
                <ThumbnailCanvasDisplay components={selectedComponents} />
            </div>

            <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl shadow-lg">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">Componentes</h2>
                <div className="h-64 md:h-auto lg:h-[calc(100%-3rem)] overflow-y-auto flex flex-wrap justify-center items-start gap-1 bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                    {reel.length > 0 ? reel.map(comp => (
                        <ComponentReelItem 
                            key={comp.id + Math.random()} // Add random for reel refresh visuals if IDs repeat
                            component={comp} 
                            onClick={() => handleComponentSelect(comp)}
                            isSelected={selectedComponents[comp.componentType]?.id === comp.id}
                        />
                    )) : <p className="text-xs text-gray-500 dark:text-gray-400 p-4">Cargando componentes...</p>}
                </div>
            </div>
        </div>
         {feedbackMessage && (
             <div className={`mt-4 p-3 rounded-md text-sm ${
                feedbackMessage.type === 'success' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200' : 
                feedbackMessage.type === 'error' ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200' :
                'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200'
            }`}>
            {feedbackMessage.text}
            </div>
        )}
    </div>
  );
};

export default ThumbnailOptimizerPage;