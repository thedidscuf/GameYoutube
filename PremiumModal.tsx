
import React from 'react';
import { PremiumBenefits } from '../types';

interface PremiumModalProps {
  onClose: () => void;
  isPremium: boolean;
  benefits: PremiumBenefits;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, isPremium, benefits }) => {
  const benefitItems = [
    { label: "Espacio Adicional para Canal", value: benefits.extraSaveSlot, icon: "fas fa-hdd" },
    { label: `Multiplicador de Ganancias (${benefits.earningsMultiplier}x)`, value: benefits.earningsMultiplier > 1, icon: "fas fa-dollar-sign" },
    { label: `Multiplicador de Vistas (${benefits.viewsMultiplier}x)`, value: benefits.viewsMultiplier > 1, icon: "fas fa-eye" },
    { label: "Insignia Exclusiva de Perfil", value: benefits.exclusiveBadge, icon: "fas fa-id-badge" },
    { label: "Costos de Energía Reducidos", value: benefits.reducedEnergyCosts, icon: "fas fa-bolt" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-6 border-b pb-3 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            <i className={`fas ${isPremium ? 'fa-star text-yellow-400' : 'fa-gem text-yellow-500'} mr-3`}></i>
            Estado Premium
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-3xl leading-none">
            &times;
          </button>
        </div>

        {isPremium ? (
          <div className="text-center">
            <p className="text-lg text-green-600 dark:text-green-400 font-semibold mb-4">¡Felicidades! Tienes acceso Premium.</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Disfruta de los siguientes beneficios:</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg text-gray-700 dark:text-gray-200 font-semibold mb-4">Desbloquea Beneficios Premium</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              ¡Sigue a <strong className="text-red-500">@project</strong> en la plataforma para activar tu estado Premium y obtener ventajas exclusivas! (Simulado para este juego)
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">(En un juego real, esto podría implicar una acción en la plataforma anfitriona).</p>
          </div>
        )}

        <ul className="space-y-3 mb-8">
          {benefitItems.map((item, index) => (
            <li key={index} className={`flex items-center p-3 rounded-md ${isPremium && item.value ? 'bg-green-50 dark:bg-green-900' : 'bg-gray-50 dark:bg-gray-700'}`}>
              <i className={`${item.icon} w-5 text-center mr-3 ${isPremium && item.value ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}></i>
              <span className={`text-sm ${isPremium && item.value ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>{item.label}</span>
              {isPremium && item.value ? (
                <i className="fas fa-check-circle text-green-500 dark:text-green-400 ml-auto"></i>
              ) : (
                 <i className="fas fa-times-circle text-gray-400 dark:text-gray-500 ml-auto opacity-50"></i>
              )}
            </li>
          ))}
        </ul>
        
        <button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export default PremiumModal;
