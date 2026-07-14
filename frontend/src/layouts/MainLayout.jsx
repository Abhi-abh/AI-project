import React from 'react';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans relative overflow-hidden">
      {/* Universal blur decoration background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

export default MainLayout;
