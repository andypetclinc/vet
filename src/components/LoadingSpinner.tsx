import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

/**
 * A reusable loading spinner component
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  fullScreen = false 
}) => {
  // Determine spinner size
  const spinnerSizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  };

  const spinnerClass = `spinner-border animate-spin inline-block rounded-full text-blue-600 border-t-transparent ${spinnerSizeClasses[size]}`;
  
  const content = (
    <div className="text-center">
      <div className={spinnerClass} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="mt-2 text-gray-700">{message}</p>}
    </div>
  );

  // Render full-screen spinner or inline spinner
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner; 