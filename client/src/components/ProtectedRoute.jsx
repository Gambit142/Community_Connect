import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { user, isInitialized } = useSelector((state) => state.login);
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#05213C] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login with current location and message as state
    return <Navigate to="/auth/login" state={{ from: location, message: "Please sign in to access this page." }} replace />;
  }

  return children;
};

export default ProtectedRoute;