import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25',
    RUNNING: 'bg-blue-500/10 text-blue-400 border border-blue-500/25 animate-pulse',
    SUCCESS: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
    FAILED: 'bg-red-500/10 text-red-400 border border-red-500/25',
  };

  const currentStyle = styles[status] || 'bg-slate-800 text-slate-400 border border-slate-750';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${currentStyle}`}>
      {status === 'RUNNING' && (
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5 animate-ping"></span>
      )}
      {status}
    </span>
  );
};

export default StatusBadge;
