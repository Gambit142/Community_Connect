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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {successMessage && <div className="text-green-600 text-sm">{successMessage}</div>}
      <div>
        <label className="block text-sm font-medium text-neutral-700">Username</label>
        <input
          value={username}
          onChange={(e) => setUserName(e.target.value)}
          required
          placeholder="testuser"
          className="mt-2 block w-full p-3 border border-neutral-200 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          placeholder="you@company.com"
          className="mt-2 block w-full p-3 border border-neutral-200 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">User Type</label>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="mt-2 block w-full p-3 border border-neutral-200 rounded-md"
        >
          <option value="individual">Individual</option>
          <option value="company">Company</option>
          <option value="organization">Organization</option>
        </select>
      </div>
      {userType !== 'individual' && (
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            {userType === 'company' ? 'Company Name' : 'Organization Name'}
          </label>
          <input
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            required
            placeholder={`Enter ${userType === 'company' ? 'company' : 'organization'} name`}
            className="mt-2 block w-full p-3 border border-neutral-200 rounded-md"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-neutral-700">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          placeholder="Create a password"
          className="mt-2 block w-full p-3 border border-neutral-200 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Confirm password</label>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          type="password"
          placeholder="Repeat your password"
          className="mt-2 block w-full p-3 border border-neutral-200 rounded-md"
        />
      </div>
      <div className="flex items-center justify-end">
        <button className="btn-black" disabled={loading}>
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </div>
    </form>
  );
}
