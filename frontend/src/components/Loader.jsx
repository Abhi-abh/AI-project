import React from 'react';

const Loader = ({ message = 'Loading...', fullPage = false }) => {
  const containerStyles = fullPage
    ? 'min-h-screen fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm'
    : 'py-12 w-full';

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${containerStyles}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="w-12 h-12 border-4 border-slate-800 border-t-brand-500 rounded-full animate-spin"></div>
        {/* Inner static brand node */}
        <div className="absolute w-4 h-4 bg-brand-500/20 rounded-full animate-ping"></div>
      </div>
      {message && (
        <p className="text-slate-400 text-sm font-medium animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default Loader;
