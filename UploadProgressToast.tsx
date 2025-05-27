
import React, { useEffect } from 'react';

interface UploadProgressToastProps {
  progress: number;
  onClose: () => void; // To hide when done or cancelled
}

const UploadProgressToast: React.FC<UploadProgressToastProps> = ({ progress, onClose }) => {
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500); // Keep toast visible for 1.5s after 100%
      return () => clearTimeout(timer);
    }
  }, [progress, onClose]);

  return (
    <div className="upload-toast dark:bg-gray-700">
      <div className="upload-toast-title dark:text-white">Subiendo video...</div>
      <div className="upload-toast-progress-bar-bg dark:bg-gray-600">
        <div
          className="upload-toast-progress-bar"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs mt-1 text-right dark:text-gray-300">{progress}%</p>
    </div>
  );
};

export default UploadProgressToast;
