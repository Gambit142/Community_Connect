import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyToken } from '../../store/auth/verifyTokenThunk.js';
import Sidebar from '../../components/admin/Sidebar';
import Navbar from '../../components/admin/Navbar';
import Preloader from '../../components/admin/Preloader';

export default function DashboardLayout() {
  const [loaded, setLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((state) => state.login);
  const navigate = useNavigate();

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

  // Check if user is admin; redirect if not
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/home', { state: { unauthorized: true } });
    }
  }, [user, navigate]);

  if (authLoading || !loaded) {
    return <Preloader show={true} />; // Show preloader during auth check
  }

  if (!user || user.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
            <div className="container mx-auto px-6 py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}