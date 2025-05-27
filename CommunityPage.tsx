
import React, { useState, useEffect } from 'react';
import { Channel, GameComment, CommentOption } from '../types';
import { PREDEFINED_COMMENTS, COMMENT_RESPONDER_ENERGY_COST, COMMENT_RESPONDER_NUM_ROUNDS, MAX_COMMUNITY_BOOST_POINTS } from '../constants';
import Tooltip from '../components/Tooltip';

interface CommunityPageProps {
  channel: Channel;
  onUpdateChannel: (updatedChannel: Channel) => void;
}

// Function to shuffle an array (Fisher-Yates shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};


const CommunityPage: React.FC<CommunityPageProps> = ({ channel, onUpdateChannel }) => {
  const [gameActive, setGameActive] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentGameComments, setCurrentGameComments] = useState<GameComment[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [canPlayToday, setCanPlayToday] = useState(true);

  useEffect(() => {
    if (channel.lastCommunityGamePlayedDay === channel.day) {
      setCanPlayToday(false);
    } else {
      setCanPlayToday(true);
    }
  }, [channel.day, channel.lastCommunityGamePlayedDay]);

  const startGame = () => {
    if (!canPlayToday) {
        setFeedbackMessage({ text: 'Ya has interactuado con la comunidad hoy. ¡Vuelve mañana!', type: 'info'});
        return;
    }
    if (channel.energy < COMMENT_RESPONDER_ENERGY_COST) {
      setFeedbackMessage({ text: `No tienes suficiente energía. Necesitas ${COMMENT_RESPONDER_ENERGY_COST}.`, type: 'error' });
      return;
    }

    const commentsForGame = shuffleArray(PREDEFINED_COMMENTS).slice(0, COMMENT_RESPONDER_NUM_ROUNDS);
    setCurrentGameComments(commentsForGame);
    setCurrentRound(0);
    setCurrentScore(0);
    setGameActive(true);
    setFeedbackMessage(null);
    setSelectedOptionIndex(null);

    onUpdateChannel({ 
        ...channel, 
        energy: channel.energy - COMMENT_RESPONDER_ENERGY_COST,
        lastCommunityGamePlayedDay: channel.day // Mark as played today
    });
    setCanPlayToday(false); // Update UI immediately
  };

  const handleOptionSelect = (option: CommentOption, optionIndex: number) => {
    if (selectedOptionIndex !== null) return; // Prevent multiple selections

    setSelectedOptionIndex(optionIndex);
    setCurrentScore(prev => Math.min(prev + option.points, MAX_COMMUNITY_BOOST_POINTS));
    setFeedbackMessage({ text: option.feedback, type: option.points > 0 ? 'success' : (option.points === 0 ? 'info' : 'error')});

    setTimeout(() => {
      if (currentRound < COMMENT_RESPONDER_NUM_ROUNDS - 1) {
        setCurrentRound(prev => prev + 1);
        setFeedbackMessage(null);
        setSelectedOptionIndex(null);
      } else {
        endGame();
      }
    }, 1500); // Show feedback for 1.5 seconds
  };

  const endGame = () => {
    setGameActive(false);
    setFeedbackMessage({ text: `¡Mini-juego completado! Has ganado ${currentScore} puntos de boost para tu próximo video.`, type: 'success' });
    onUpdateChannel({ ...channel, pendingCommunityBoost: (channel.pendingCommunityBoost || 0) + currentScore });
     // Reset for next game possibility (though day lock prevents immediate replay)
    setTimeout(() => {
        if (channel.lastCommunityGamePlayedDay !== channel.day) { // Check if day has advanced
            setCanPlayToday(true);
        }
    }, 2000);
  };

  const currentComment = gameActive ? currentGameComments[currentRound] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 sm:mb-0">Comunidad</h1>
        {gameActive && (
            <div className="text-sm text-gray-700 dark:text-gray-300">
                <span>Puntos de Boost: <strong className="text-blue-500 dark:text-blue-400">{currentScore}</strong></span> / 
                <span> Comentario: <strong className="text-blue-500 dark:text-blue-400">{currentRound + 1}</strong> de {COMMENT_RESPONDER_NUM_ROUNDS}</span>
            </div>
        )}
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

      {!gameActive ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
          <i className="fas fa-comments text-5xl text-red-500 dark:text-red-400 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Interactúa con tu Comunidad</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Responde a los comentarios para ganar un pequeño boost en tu próximo video. <br/>
            Cuesta <strong className="text-yellow-500">{COMMENT_RESPONDER_ENERGY_COST} de energía</strong> y puedes jugar una vez al día.
          </p>
          <Tooltip text={!canPlayToday ? "Ya has jugado hoy. ¡Vuelve mañana!" : (channel.energy < COMMENT_RESPONDER_ENERGY_COST ? `Necesitas ${COMMENT_RESPONDER_ENERGY_COST} energía` : "Empezar mini-juego") }>
            <button
              onClick={startGame}
              disabled={!canPlayToday || channel.energy < COMMENT_RESPONDER_ENERGY_COST}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-play mr-2"></i>Jugar Mini-juego ({COMMENT_RESPONDER_ENERGY_COST} <i className="fas fa-bolt text-xs"></i>)
            </button>
          </Tooltip>
           {channel.pendingCommunityBoost && channel.pendingCommunityBoost > 0 && (
            <p className="text-sm text-blue-500 dark:text-blue-400 mt-4">
                <i className="fas fa-info-circle mr-1"></i>Tienes {channel.pendingCommunityBoost} puntos de boost pendientes para tu próximo video.
            </p>
          )}
        </div>
      ) : currentComment && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1">De: {currentComment.author}</p>
            <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed">{currentComment.text}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentComment.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option, index)}
                disabled={selectedOptionIndex !== null}
                className={`w-full p-3 text-left rounded-md transition-all duration-200 ease-in-out border-2
                            ${selectedOptionIndex === index ? 
                                (option.isCorrect || option.points > 0 ? 'bg-green-500 border-green-600 text-white animate-pulse' : 
                                 option.points < 0 ? 'bg-red-500 border-red-600 text-white animate-pulse' : 
                                 'bg-blue-500 border-blue-600 text-white animate-pulse') 
                                : 
                                'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 hover:border-red-500 dark:hover:border-red-400 disabled:opacity-60 disabled:cursor-not-allowed'
                            } 
                            text-gray-800 dark:text-white`}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
