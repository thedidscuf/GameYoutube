
import React from 'react';

interface NewGamePopupProps {
  onClose: () => void;
}

const NewGamePopup: React.FC<NewGamePopupProps> = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content dark:bg-gray-800">
        <h2 className="popup-title dark:text-red-400">¡Noticias Emocionantes!</h2>
        <p className="popup-message dark:text-gray-300">
          ¡Gracias por jugar Youtube Studio Simulator! Estamos trabajando arduamente en un <strong>nuevo juego de simulación</strong> que llegará muy pronto. 
          ¡Espera más detalles y prepárate para una experiencia aún mayor!
        </p>
        <button onClick={onClose} className="popup-button">
          ¡Entendido!
        </button>
      </div>
    </div>
  );
};

export default NewGamePopup;
