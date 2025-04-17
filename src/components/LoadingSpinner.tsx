import React, { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const loadingMessages = [
  'Loading...',
  'Initializing app...',
  'Fetching data...',
  'Almost there...',
  'Just a moment...'
];

/**
 * A reusable loading spinner component with rotating messages
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  fullScreen = false 
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Rotate messages every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        prevIndex === loadingMessages.length - 1 ? 0 : prevIndex + 1
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Determine spinner size
  const spinnerSizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  };

  const spinnerClass = `animate-spin inline-block rounded-full border-blue-600 border-t-transparent ${spinnerSizeClasses[size]}`;
  
  const content = (
    <div className="text-center space-y-4">
      <div className="relative">
        <div className={spinnerClass} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-white rounded-full"></div>
        </div>
      </div>
      <div className="h-6">
        <p className="text-gray-700 transition-opacity duration-500">
          {loadingMessages[currentMessageIndex]}
        </p>
      </div>
    </div>
  );

  // Render full-screen spinner or inline spinner
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default LoadingSpinner; 