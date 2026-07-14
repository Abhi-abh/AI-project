import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import AuthLayout from '../../layouts/AuthLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState('');
  const { login, error: authError, loading, clearError, user } = useAuth();
  const navigate = useNavigate();

  // Reset errors on mount and redirect if already authenticated
  useEffect(() => {
    clearError();
    setLocalError('');
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    try {
      await login(email, password);
      // Remember me logic (local storage key for email helper)
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      navigate('/dashboard');
    } catch (err) {
      // Caught and set by AuthContext
    }
  };

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
          Account Login
        </h2>
        <p className="text-slate-400 mt-2 text-sm">
          Sign in to access your task dashboard
        </p>
      </div>

      {/* Errors Display */}
      {(localError || authError) && (
        <div className="mb-6 bg-red-500/15 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
          <span className="font-semibold mt-0.5">Error:</span>
          <span className="flex-1">{localError || authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          id="email"
          type="email"
          placeholder="name@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-350 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-brand-600 focus:ring-brand-500 focus:ring-offset-slate-950 cursor-pointer"
              disabled={loading}
            />
            Remember Me
          </label>
          <button
            type="button"
            onClick={() => alert('Forgot Password functionality is not implemented in backend (UI mockup only).')}
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors focus:outline-none"
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3"
          loading={loading}
        >
          Sign In
        </Button>
      </form>

      <p className="text-center text-slate-400 text-sm mt-8">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
