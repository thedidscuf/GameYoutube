
import React, { useState, useRef } from 'react';
import { Channel, DEFAULT_PROFILE_PICTURE } from '../types';

interface CustomizationPageProps {
  channel: Channel;
  onUpdateChannel: (updatedChannel: Channel) => void;
}

const CustomizationPage: React.FC<CustomizationPageProps> = ({ channel, onUpdateChannel }) => {
  const [channelName, setChannelName] = useState(channel.name);
  const [profilePicture, setProfilePicture] = useState(channel.profilePicture);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleSaveChanges = () => {
    if (!channelName.trim()) {
      alert("El nombre del canal no puede estar vacío.");
      return;
    }
    onUpdateChannel({
      ...channel,
      name: channelName,
      profilePicture: profilePicture || DEFAULT_PROFILE_PICTURE,
    });
    setSuccessMessage('¡Cambios guardados exitosamente!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Personalización del Canal</h1>

      {successMessage && (
        <div className="bg-green-100 dark:bg-green-800 border-l-4 border-green-500 text-green-700 dark:text-green-200 p-4 rounded-md shadow" role="alert">
          <p className="font-bold">Éxito</p>
          <p>{successMessage}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3 dark:border-gray-700">Marca del Canal</h2>
        
        <div className="grid md:grid-cols-3 gap-6 items-center mb-8">
          <div className="md:col-span-1 text-center md:text-left">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foto de perfil</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tu foto de perfil aparecerá donde se muestre tu canal en YouTube, como junto a tus videos y comentarios.</p>
          </div>
          <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-4">
            <img
              src={profilePicture || DEFAULT_PROFILE_PICTURE}
              alt="Perfil"
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600 shadow-sm"
            />
            <div>
                <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg shadow transition-colors"
                >
                CAMBIAR
                </button>
                <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/png, image/jpeg"
                className="hidden"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Se recomienda usar una imagen de al menos 98&nbsp;x&nbsp;98&nbsp;píxeles y que no supere los 4&nbsp;MB. Usa un archivo PNG o GIF (sin animaciones).</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
             <div className="md:col-span-1 text-center md:text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del canal</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Elige un nombre de canal que te represente a ti y a tu contenido.</p>
             </div>
             <div className="md:col-span-2">
                <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="Nombre de tu canal"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
             </div>
        </div>

        <div className="mt-8 pt-6 border-t dark:border-gray-700 flex justify-end">
            <button
                onClick={handleSaveChanges}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
                Guardar Cambios
            </button>
        </div>

      </div>
    </div>
  );
};

export default CustomizationPage;
