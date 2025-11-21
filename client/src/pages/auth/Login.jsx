import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/auth/loginSlice.js';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, successMessage, user } = useSelector((state) => state.login);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      return;
    }
    dispatch(loginUser({ email, password }));
  }

  useEffect(() => {
    if (successMessage && user) {
      const redirectPath = user.role === 'admin' ? '/admin' : '/';
      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);
    }
  }, [successMessage, user, navigate]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Status Messages */}
      {location.state?.message && (
        <div className="p-4 rounded-2xl bg-blue-400/20 backdrop-blur-xl border border-blue-300/40 text-blue-900 text-sm font-medium shadow-lg">
          {location.state.message}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-red-400/20 backdrop-blur-xl border border-red-300/40 text-red-900 text-sm font-medium shadow-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-green-400/20 backdrop-blur-xl border border-green-300/40 text-green-900 text-sm font-medium shadow-lg">
          {successMessage}
        </div>
      )}

      {/* Email Input */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          placeholder="you@company.com"
          disabled={loading}
          className="w-full px-5 py-3.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-white/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:bg-white/50 hover:border-white/70"
        />
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          placeholder="••••••••"
          disabled={loading}
          className="w-full px-5 py-3.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-white/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:bg-white/50 hover:border-white/70"
        />
      </div>

      {/* Button Container */}
      <div className="flex items-center gap-3 pt-6">
        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="flex-1 px-6 py-3.5 bg-gradient-to-br from-neutral-900 to-neutral-700 hover:from-neutral-800 hover:to-neutral-600 text-white font-semibold rounded-2xl transition-all duration-300 disabled:from-neutral-300 disabled:to-neutral-200 disabled:cursor-not-allowed active:scale-95 shadow-xl hover:shadow-2xl border border-neutral-700/50 backdrop-blur-xl transform hover:scale-105"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Signing in...
            </span>
          ) : (
            'Sign in'
          )}
        </button>

        {/* Forgot Password Button */}
        <a
          href="/auth/forgot"
          className="px-6 py-3.5 bg-white/40 backdrop-blur-xl hover:bg-white/60 text-neutral-700 font-semibold rounded-2xl transition-all duration-300 border border-white/60 hover:border-white/80 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
        >
          Forgot?
        </a>
      </div>
    </form>
  );
}