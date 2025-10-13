import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/auth/loginSlice.js';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const user = useSelector((state) => state.login.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Hello, {user?.username || 'User'}!</h1>
        <p className="text-gray-600 mb-6">Welcome to Community Connect.</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}