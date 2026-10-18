import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangleIcon } from '../components/Icons';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate('/home');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err?.message || 'Invalid username or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFEFDE] dark:bg-[#001845] px-4 py-12 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-[#001233] rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#001233] dark:text-[#EFEFDE] tracking-tight">
            Swap<span className="text-[#2A67C9]">It</span>
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome back! Log in to trade, repair, and earn SwapCoins.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-red-700 dark:text-red-400 text-sm">
            <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. johndoe"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A67C9] focus:border-transparent transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A67C9] focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[#2A67C9] hover:bg-[#2356a8] disabled:opacity-60 text-white font-semibold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-[#2A67C9] hover:underline dark:text-[#E9D8A6]"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
