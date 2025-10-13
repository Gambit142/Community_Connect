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
      {message && <div className="text-green-600 text-sm">{message}</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-neutral-700">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          placeholder="you@company.com"
          className="mt-2 block w-full p-3 border border-neutral-200 rounded-md"
          disabled={loading}
        />
      </div>
      <div className="flex items-center justify-end">
        <button className="btn-black" disabled={loading || !email}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </div>
    </form>
  );
}