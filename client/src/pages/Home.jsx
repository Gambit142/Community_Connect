// Updated: client/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/auth/loginSlice.js';
import { verifyToken } from '../store/auth/verifyTokenThunk.js';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const location = useLocation();
  const { user, loading: authLoading } = useSelector((state) => state.login);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const isUnauthorized = location.state?.unauthorized;

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Verify token on mount if no user but token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user && token && !authLoading) {
      dispatch(verifyToken());
    }
  }, [user, authLoading, dispatch]);

  // Redirect admins away from this page
  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

  if (authLoading || !loaded) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        {isUnauthorized && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            You are not authorized to view that page.
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Hello, {user?.username || 'User'}!</h1>
        <p className="text-gray-600 mb-6">Welcome to Community Connect. Role: <span className="px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-800">{user?.role}</span></p>
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