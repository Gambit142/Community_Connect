import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearMessage } from '../../store/auth/forgotSlice.js';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { loading, message, error } = useSelector((state) => state.forgot);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    dispatch(forgotPassword(email));
  }

  useEffect(() => {
    return () => dispatch(clearMessage()); // Clear on unmount
  }, [dispatch]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status Messages */}
      {message && (
        <div className="p-4 rounded-2xl bg-green-400/20 backdrop-blur-xl border border-green-300/40 text-green-900 text-sm font-medium shadow-lg">
          {message}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-red-400/20 backdrop-blur-xl border border-red-300/40 text-red-900 text-sm font-medium shadow-lg">
          {error}
        </div>
      )}

      {/* Email Input */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">Email address</label>
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

      {/* Submit Button */}
      <div className="flex items-center justify-end pt-6">
        <button
          type="submit"
          disabled={loading || !email}
          className="px-8 py-3.5 bg-gradient-to-br from-neutral-900 to-neutral-700 hover:from-neutral-800 hover:to-neutral-600 text-white font-semibold rounded-2xl transition-all duration-300 disabled:from-neutral-300 disabled:to-neutral-200 disabled:cursor-not-allowed active:scale-95 shadow-xl hover:shadow-2xl border border-neutral-700/50 backdrop-blur-xl transform hover:scale-105"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Sending...
            </span>
          ) : (
            'Send reset link'
          )}
        </button>
      </div>
    </form>
  );
}