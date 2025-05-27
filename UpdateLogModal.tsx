
import React from 'react';

interface UpdateLogEntry {
  version: string;
  date: string;
  changes: string[];
}

interface UpdateLogModalProps {
  onClose: () => void;
  updateLog: UpdateLogEntry[];
}

const UpdateLogModal: React.FC<UpdateLogModalProps> = ({ onClose, updateLog }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b pb-3 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Registro de Cambios</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-2xl">
            &times;
          </button>
        </div>
        <div className="overflow-y-auto flex-grow pr-2">
          {updateLog.map((entry, index) => (
            <div key={index} className={`py-3 ${index < updateLog.length - 1 ? 'border-b dark:border-gray-700' : ''}`}>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-500">{entry.version} <span className="text-sm text-gray-500 dark:text-gray-400">- {entry.date}</span></h3>
              <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {entry.changes.map((change, idx) => (
                  <li key={idx}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <button
            onClick={onClose}
            className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
            Cerrar
        </button>
      </div>
    </div>
  );
};

export default UpdateLogModal;
