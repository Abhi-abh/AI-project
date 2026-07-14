import React from 'react';

const Input = ({
  label,
  id,
  type = 'text',
  placeholder = '',
  error = '',
  helperText = '',
  disabled = false,
  className = '',
  value,
  onChange,
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-slate-300 text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full bg-slate-950/80 border text-slate-100 placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
          error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
            : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500/30'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};

export default Input;
