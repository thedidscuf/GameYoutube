
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Channel, StreamPrompt, StreamBonus, StreamPromptDataKeyword, StreamPromptDataEmoji, StreamPromptDataClick } from '../types';
import {
  STREAMER_SENSATION_ENERGY_COST,
  STREAM_DURATION_SECONDS,
  PROMPT_DEFAULT_DURATION_SECONDS,
  HYPE_METER_MAX,
  HYPE_METER_INITIAL,
  HYPE_METER_MIN_THRESHOLD_FAIL,
  HYPE_DECAY_RATE_PER_SECOND,
  PREDEFINED_STREAM_PROMPTS,
  MAX_STREAM_BONUS_MULTIPLIERS,
} from '../constants';
import Tooltip from '../components/Tooltip';

// Helper to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface StreamerSensationPageProps {
  channel: Channel;
  onUpdateChannel: (updatedChannel: Channel) => void;
}

type GamePhase = 'idle' | 'countdown' | 'playing' | 'failed' | 'success';

const StreamerSensationPage: React.FC<StreamerSensationPageProps> = ({ channel, onUpdateChannel }) => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle');
  const [hypeMeter, setHypeMeter] = useState(HYPE_METER_INITIAL);
  const [streamTimeLeft, setStreamTimeLeft] = useState(STREAM_DURATION_SECONDS);
  const [countdownTime, setCountdownTime] = useState(3);
  const [currentPrompt, setCurrentPrompt] = useState<StreamPrompt | null>(null);
  const [promptTimeLeft, setPromptTimeLeft] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [canPlayToday, setCanPlayToday] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [totalHypeAccumulated, setTotalHypeAccumulated] = useState(0);
  const [successfulInteractions, setSuccessfulInteractions] = useState(0);

  const keywordInputRef = useRef<HTMLInputElement>(null);
  const promptIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hypeDecayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const promptDisplayTimerRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    setCanPlayToday(channel.lastStreamGamePlayedDay !== channel.day);
  }, [channel.day, channel.lastStreamGamePlayedDay]);
  
  const resetGameTimers = () => {
    if (promptIntervalRef.current) clearInterval(promptIntervalRef.current);
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    if (hypeDecayTimerRef.current) clearInterval(hypeDecayTimerRef.current);
    if (promptDisplayTimerRef.current) clearInterval(promptDisplayTimerRef.current);
  };

  const cleanupGame = () => {
    resetGameTimers();
    setCurrentPrompt(null);
    setUserInput('');
  };
  
  // Game Over logic
  const handleGameOver = useCallback((status: 'success' | 'failed') => {
    cleanupGame();
    setGamePhase(status);

    if (status === 'success') {
      const averageHype = successfulInteractions > 0 ? totalHypeAccumulated / successfulInteractions : HYPE_METER_INITIAL;
      const hypeRatio = Math.max(0, Math.min(averageHype / HYPE_METER_MAX, 1)); // Normalized 0-1

      const viewsBonus = 1 + (MAX_STREAM_BONUS_MULTIPLIERS.views - 1) * hypeRatio;
      const subsBonus = 1 + (MAX_STREAM_BONUS_MULTIPLIERS.subs - 1) * hypeRatio;
      const moneyBonus = 1 + (MAX_STREAM_BONUS_MULTIPLIERS.money - 1) * hypeRatio;
      
      const streamBonus: StreamBonus = {
        viewsMultiplier: parseFloat(viewsBonus.toFixed(2)),
        subsMultiplier: parseFloat(subsBonus.toFixed(2)),
        moneyMultiplier: parseFloat(moneyBonus.toFixed(2)),
      };

      onUpdateChannel({ ...channel, pendingStreamBonus: streamBonus });
      setFeedbackMessage({ text: `¡Stream exitoso! Hype promedio: ${averageHype.toFixed(0)}. Bonus aplicado: Vistas x${streamBonus.viewsMultiplier}, Subs x${streamBonus.subsMultiplier}, Dinero x${streamBonus.moneyMultiplier}`, type: 'success' });
    } else {
      setFeedbackMessage({ text: '¡Oh no! El stream no tuvo el hype esperado. Inténtalo de nuevo mañana.', type: 'error' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, onUpdateChannel, successfulInteractions, totalHypeAccumulated]);


  // Main stream timer and hype decay
  useEffect(() => {
    if (gamePhase === 'playing') {
      streamTimerRef.current = setInterval(() => {
        setStreamTimeLeft(prev => {
          if (prev <= 1) {
            handleGameOver('success');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      hypeDecayTimerRef.current = setInterval(() => {
        setHypeMeter(prev => {
          const newHype = Math.max(0, prev - HYPE_DECAY_RATE_PER_SECOND);
          if (newHype < HYPE_METER_MIN_THRESHOLD_FAIL) {
            handleGameOver('failed');
            return HYPE_METER_MIN_THRESHOLD_FAIL -1; // Ensure it shows below threshold
          }
          return newHype;
        });
      }, 1000);
    }
    return resetGameTimers;
  }, [gamePhase, handleGameOver]);

  // Prompt generation and display timer
  useEffect(() => {
    if (gamePhase === 'playing' && !currentPrompt) {
        // Generate new prompt about every 5-10 seconds
        const delay = Math.random() * 5000 + 5000; 
        promptIntervalRef.current = setTimeout(() => {
            const newPrompt = shuffleArray(PREDEFINED_STREAM_PROMPTS)[0];
            setCurrentPrompt(newPrompt);
            setPromptTimeLeft(newPrompt.durationSeconds);
            if (newPrompt.type === 'KEYWORD_TYPE' && keywordInputRef.current) {
                keywordInputRef.current.focus();
            }
        }, delay);
    }
    
    if (currentPrompt && promptTimeLeft > 0) {
        promptDisplayTimerRef.current = setInterval(() => {
            setPromptTimeLeft(prev => {
                if (prev <= 1) {
                    // Time ran out for this prompt - considered a failure
                    handleInteraction(false, currentPrompt.pointsForFailure);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    } else if (currentPrompt && promptTimeLeft <= 0 && gamePhase === 'playing') {
        // This case should be handled by the interval itself, but as a fallback:
        handleInteraction(false, currentPrompt.pointsForFailure);
    }

    return () => {
        if (promptIntervalRef.current) clearTimeout(promptIntervalRef.current);
        if (promptDisplayTimerRef.current) clearInterval(promptDisplayTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, currentPrompt, promptTimeLeft]); // Removed handleInteraction from deps


  const startCountdown = () => {
    if (!canPlayToday) {
      setFeedbackMessage({ text: 'Ya has hecho un stream hoy. ¡Vuelve mañana!', type: 'info' });
      return;
    }
    if (channel.energy < STREAMER_SENSATION_ENERGY_COST) {
      setFeedbackMessage({ text: `No tienes suficiente energía. Necesitas ${STREAMER_SENSATION_ENERGY_COST}.`, type: 'error' });
      return;
    }

    onUpdateChannel({
      ...channel,
      energy: channel.energy - STREAMER_SENSATION_ENERGY_COST,
      lastStreamGamePlayedDay: channel.day,
    });
    setCanPlayToday(false);
    setGamePhase('countdown');
    setFeedbackMessage(null);
    setCountdownTime(3);
  };

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;
    if (gamePhase === 'countdown' && countdownTime > 0) {
      countdownTimer = setTimeout(() => setCountdownTime(prev => prev - 1), 1000);
    } else if (gamePhase === 'countdown' && countdownTime === 0) {
      setGamePhase('playing');
      setHypeMeter(HYPE_METER_INITIAL);
      setStreamTimeLeft(STREAM_DURATION_SECONDS);
      setTotalHypeAccumulated(0);
      setSuccessfulInteractions(0);
    }
    return () => clearTimeout(countdownTimer);
  }, [gamePhase, countdownTime]);

  const handleInteraction = (success: boolean, points: number) => {
    if (gamePhase !== 'playing' || !currentPrompt) return;

    if (promptDisplayTimerRef.current) clearInterval(promptDisplayTimerRef.current); // Stop this prompt's timer

    setHypeMeter(prev => Math.min(HYPE_METER_MAX, Math.max(0, prev + points)));
    if (success) {
        setTotalHypeAccumulated(prev => prev + (hypeMeter + points)); // accumulate current hype after points
        setSuccessfulInteractions(prev => prev + 1);
    }
    
    setCurrentPrompt(null); // Clear current prompt, new one will be generated
    setUserInput('');
    setPromptTimeLeft(0);
  };

  const handleKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPrompt || currentPrompt.type !== 'KEYWORD_TYPE') return;
    const success = userInput.trim().toLowerCase() === (currentPrompt.data as StreamPromptDataKeyword).keyword.toLowerCase();
    handleInteraction(success, success ? currentPrompt.pointsForSuccess : currentPrompt.pointsForFailure);
  };

  const handleEmojiClick = (emoji: string) => {
    if (!currentPrompt || currentPrompt.type !== 'EMOJI_SELECT') return;
    const success = emoji === (currentPrompt.data as StreamPromptDataEmoji).correctEmoji;
    handleInteraction(success, success ? currentPrompt.pointsForSuccess : currentPrompt.pointsForFailure);
  };
  
  const handleQuickClick = () => {
    if (!currentPrompt || currentPrompt.type !== 'QUICK_CLICK') return;
    handleInteraction(true, currentPrompt.pointsForSuccess);
  };


  const renderGameContent = () => {
    if (gamePhase === 'idle' || gamePhase === 'failed' || gamePhase === 'success') {
      return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
          <i className="fas fa-broadcast-tower text-5xl text-red-500 dark:text-red-400 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Streamer Sensation</h2>
          {gamePhase === 'idle' && (
            <>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                ¡Prepárate para salir EN VIVO! Reacciona a los eventos del chat para mantener el Hype.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Cuesta <strong className="text-yellow-500">{STREAMER_SENSATION_ENERGY_COST} de energía</strong>. Duración: {STREAM_DURATION_SECONDS}s.
              </p>
              <Tooltip text={!canPlayToday ? "Ya jugaste hoy" : (channel.energy < STREAMER_SENSATION_ENERGY_COST ? `Necesitas ${STREAMER_SENSATION_ENERGY_COST} energía` : "¡Empezar Stream!")}>
                <button
                  onClick={startCountdown}
                  disabled={!canPlayToday || channel.energy < STREAMER_SENSATION_ENERGY_COST}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition disabled:opacity-50"
                >
                  <i className="fas fa-play mr-2"></i>¡EN VIVO! ({STREAMER_SENSATION_ENERGY_COST} <i className="fas fa-bolt text-xs"></i>)
                </button>
              </Tooltip>
            </>
          )}
          {(gamePhase === 'failed' || gamePhase === 'success') && (
             <Tooltip text={!canPlayToday ? "Ya jugaste hoy" : "Jugar de nuevo (mañana)"}>
                <button
                onClick={() => { setGamePhase('idle'); setFeedbackMessage(null); }}
                disabled={canPlayToday && channel.energy < STREAMER_SENSATION_ENERGY_COST}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition disabled:opacity-50"
                >
                <i className="fas fa-redo mr-2"></i>Jugar de nuevo (Mañana)
                </button>
            </Tooltip>
          )}
          {channel.pendingStreamBonus && (gamePhase === 'idle' || gamePhase === 'failed' || gamePhase === 'success') && (
             <p className="text-sm text-teal-500 dark:text-teal-400 mt-4">
                <i className="fas fa-star mr-1"></i>Tienes un Bonus de Stream pendiente: Vistas x{channel.pendingStreamBonus.viewsMultiplier}, Subs x{channel.pendingStreamBonus.subsMultiplier}.
            </p>
          )}
        </div>
      );
    }

    if (gamePhase === 'countdown') {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <p className="text-6xl font-bold text-red-500 dark:text-red-400 animate-ping">{countdownTime}</p>
          <p className="text-xl text-gray-700 dark:text-gray-300 mt-4">¡Prepárate para el directo!</p>
        </div>
      );
    }

    // GamePhase 'playing'
    return (
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg space-y-4">
        {/* Hype Meter and Timers */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="w-full sm:w-1/2">
                <div className="flex justify-between text-xs mb-1 text-gray-600 dark:text-gray-300">
                    <span>Hype Meter</span>
                    <span>{hypeMeter.toFixed(0)}/{HYPE_METER_MAX}</span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-5 overflow-hidden border border-gray-400 dark:border-gray-500">
                    <div 
                        className={`h-full rounded-full transition-all duration-300 ease-linear ${hypeMeter < HYPE_METER_MIN_THRESHOLD_FAIL ? 'bg-red-600 animate-pulse' : hypeMeter < 50 ? 'bg-yellow-500' :  'bg-green-500'}`}
                        style={{ width: `${(hypeMeter / HYPE_METER_MAX) * 100}%`}}
                    ></div>
                </div>
            </div>
             <div className="flex gap-4 text-center">
                <div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Stream</div>
                    <div className="text-xl font-bold text-red-500 dark:text-red-400">{streamTimeLeft}s</div>
                </div>
                {currentPrompt && (
                    <div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">Prompt</div>
                        <div className="text-xl font-bold text-blue-500 dark:text-blue-400">{promptTimeLeft}s</div>
                    </div>
                )}
            </div>
        </div>

        {/* Prompt Area */}
        <div className="min-h-[150px] bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex flex-col items-center justify-center text-center shadow-inner">
          {!currentPrompt && <p className="text-gray-500 dark:text-gray-400">Esperando acción del chat...</p>}
          {currentPrompt && (
            <div className="w-full">
              <p className="text-lg font-semibold text-gray-800 dark:text-white mb-3">{currentPrompt.displayText}</p>
              {currentPrompt.type === 'QUICK_CLICK' && (
                <button onClick={handleQuickClick} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md text-lg transition animate-fade-in-fast">
                  {(currentPrompt.data as StreamPromptDataClick).buttonText}
                </button>
              )}
              {currentPrompt.type === 'KEYWORD_TYPE' && (
                <form onSubmit={handleKeywordSubmit} className="flex gap-2 justify-center animate-fade-in-fast">
                  <input
                    ref={keywordInputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={(currentPrompt.data as StreamPromptDataKeyword).placeholder}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow">Enviar</button>
                </form>
              )}
              {currentPrompt.type === 'EMOJI_SELECT' && (
                <div className="flex justify-center gap-2 animate-fade-in-fast">
                  {(currentPrompt.data as StreamPromptDataEmoji).emojis.map(emoji => (
                    <button key={emoji} onClick={() => handleEmojiClick(emoji)} className="text-3xl p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md shadow transition">
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 sm:mb-0">Streamer Sensation</h1>
      </div>
       {feedbackMessage && (
        <div className={`p-3 rounded-md text-sm ${
            feedbackMessage.type === 'success' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 border-l-4 border-green-500' : 
            feedbackMessage.type === 'error' ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 border-l-4 border-red-500' :
            'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 border-l-4 border-blue-500'
        }`}>
          {feedbackMessage.text}
        </div>
      )}
      {renderGameContent()}
    </div>
  );
};

export default StreamerSensationPage;
