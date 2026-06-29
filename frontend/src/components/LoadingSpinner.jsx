import React from 'react';

const LoadingSpinner = ({ fullPage = false, message = '' }) => {
  if (fullPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        {message && <p className="text-gray-500 text-sm">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      {message && <p className="text-gray-500 text-sm">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
