import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../store/auth/registerSlice.js';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [userType, setUserType] = useState('individual');
  const [organizationName, setOrganizationName] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.register);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }
    const userData = {
      username,
      email,
      password,
      confirmPassword: confirm,
      userType,
      ...(userType !== 'individual' && { organizationDetails: { name: organizationName } }),
    };
    dispatch(registerUser(userData));
  }

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        setUserName('');
        setEmail('');
        setPassword('');
        setConfirm('');
        setUserType('individual');
        setOrganizationName('');
      }, 2000);
    }
  }, [successMessage]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Status Messages */}
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

      {/* Username Input */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">Username</label>
        <input
          value={username}
          onChange={(e) => setUserName(e.target.value)}
          required
          placeholder="testuser"
          disabled={loading}
          className="w-full px-5 py-3.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-white/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:bg-white/50 hover:border-white/70"
        />
      </div>

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

      {/* User Type Select */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">User Type</label>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          disabled={loading}
          className="w-full px-5 py-3.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-white/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:bg-white/50 hover:border-white/70"
        >
          <option value="individual">Individual</option>
          <option value="company">Company</option>
          <option value="organization">Organization</option>
        </select>
      </div>

      {/* Organization/Company Name Input */}
      {userType !== 'individual' && (
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">
            {userType === 'company' ? 'Company Name' : 'Organization Name'}
          </label>
          <input
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            required
            placeholder={`Enter ${userType === 'company' ? 'company' : 'organization'} name`}
            disabled={loading}
            className="w-full px-5 py-3.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-white/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:bg-white/50 hover:border-white/70"
          />
        </div>
      )}

      {/* Password Input */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          placeholder="Create a password"
          disabled={loading}
          className="w-full px-5 py-3.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-white/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:bg-white/50 hover:border-white/70"
        />
      </div>

      {/* Confirm Password Input */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">Confirm password</label>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          type="password"
          placeholder="Repeat your password"
          disabled={loading}
          className="w-full px-5 py-3.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-white/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:bg-white/50 hover:border-white/70"
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end pt-6">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 bg-gradient-to-br from-neutral-900 to-neutral-700 hover:from-neutral-800 hover:to-neutral-600 text-white font-semibold rounded-2xl transition-all duration-300 disabled:from-neutral-300 disabled:to-neutral-200 disabled:cursor-not-allowed active:scale-95 shadow-xl hover:shadow-2xl border border-neutral-700/50 backdrop-blur-xl transform hover:scale-105"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Creating...
            </span>
          ) : (
            'Create account'
          )}
        </button>
      </div>
    </form>
  );
}