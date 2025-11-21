import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearMessage } from '../../store/auth/forgotSlice.js';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function Reset() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, message, error } = useSelector((state) => state.forgot);

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      dispatch(clearMessage());
      return;
    }
    if (!token) {
      dispatch(clearMessage());
      return;
    }
    dispatch(resetPassword({ token, newPassword }));
  }

  useEffect(() => {
    if (message && message.includes('successful')) {
      setTimeout(() => {
        navigate('/auth/login', { state: { success: 'Password reset successful. Please log in.' } });
      }, 2000);
    }
    return () => dispatch(clearMessage());
  }, [message, navigate, dispatch]);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="p-6 rounded-2xl bg-red-400/20 backdrop-blur-xl border border-red-300/40">
          <h1 className="text-2xl font-bold text-red-900">Invalid Reset Link</h1>
          <p className="mt-3 text-red-800">Please request a new password reset.</p>
        </div>
      </div>
    );
  }

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

      {/* New Password Input */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">New Password</label>
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          type="password"
          placeholder="New password (min 6 chars)"
          disabled={loading}
          className="w-full px-5 py-3.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-white/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:bg-white/50 hover:border-white/70"
        />
      </div>

      {/* Confirm Password Input */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">Confirm New Password</label>
        <input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          type="password"
          placeholder="Repeat new password"
          disabled={loading}
          className="w-full px-5 py-3.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-white/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:bg-white/50 hover:border-white/70"
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end pt-6">
        <button
          type="submit"
          disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
          className="px-8 py-3.5 bg-gradient-to-br from-neutral-900 to-neutral-700 hover:from-neutral-800 hover:to-neutral-600 text-white font-semibold rounded-2xl transition-all duration-300 disabled:from-neutral-300 disabled:to-neutral-200 disabled:cursor-not-allowed active:scale-95 shadow-xl hover:shadow-2xl border border-neutral-700/50 backdrop-blur-xl transform hover:scale-105"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Resetting...
            </span>
          ) : (
            'Reset Password'
          )}
        </button>
      </div>
    </form>
  );
}