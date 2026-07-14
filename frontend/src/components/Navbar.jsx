import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 lg:hidden transition-colors focus:outline-none"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Brand logo details placeholder for mobile view alignment */}
      <div className="lg:hidden font-bold bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
        AI Platform
      </div>

      {/* Spacer to right-align items */}
      <div className="hidden lg:block text-slate-500 text-xs font-mono">
        v1.0.0
      </div>

      {/* User Information */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-200">{user.fullName}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
