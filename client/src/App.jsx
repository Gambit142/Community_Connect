import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store.js';
import './styles/auth.css';
import AuthLayout from './components/AuthLayout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Forgot from './pages/auth/Forgot';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<Navigate to="login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="forgot" element={<Forgot />} />
          </Route>
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;