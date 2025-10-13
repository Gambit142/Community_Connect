import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/auth/loginSlice.js';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    }
  }, [successMessage, user, navigate]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {successMessage && <div className="text-green-600 text-sm">{successMessage}</div>}
      <div>
        <label className="block text-sm font-medium text-neutral-700">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          placeholder="you@company.com"
          className="mt-2 block w-full p-3 border border-neutral-200 rounded-md focus:ring-2 focus:ring-black"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          placeholder="Your password"
          className="mt-2 block w-full p-3 border border-neutral-200 rounded-md"
          disabled={loading}
        />
      </div>
      <div className="flex items-center justify-between">
        <button className="btn-black" disabled={loading || !email || !password}>
          {loading ? 'Signing...' : 'Sign in'}
        </button>
        <a className="text-sm text-neutral-500 hover:underline" href="/auth/forgot">
          Forgot?
        </a>
      </div>
    </form>
  );
}