import React from 'react';

const Card = ({ children, title, subtitle, className = '', headerActions, ...props }) => {
  return (
    <div
      className={`bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl overflow-hidden ${className}`}
      {...props}
    >
      {(title || subtitle || headerActions) && (
        <div className="border-b border-slate-850 px-6 py-5 flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
    </div>
  );
};

export default Card;
