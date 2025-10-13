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
      return; // Or set error via action if needed
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
    return () => dispatch(clearMessage()); // Clear on unmount
  }, [message, navigate, dispatch]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
          <p className="mt-2 text-neutral-500">Please request a new password reset.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && <div className="text-green-600 text-sm">{message}</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-neutral-700">New Password</label>
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          type="password"
          placeholder="New password (min 6 chars)"
          className="mt-2 block w-full p-3 border border-neutral-200 rounded-md"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Confirm New Password</label>
        <input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          type="password"
          placeholder="Repeat new password"
          className="mt-2 block w-full p-3 border border-neutral-200 rounded-md"
          disabled={loading}
        />
      </div>
      <div className="flex items-center justify-end">
        <button className="btn-black" disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </div>
    </form>
  );
}