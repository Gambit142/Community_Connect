import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store.js';
import './styles/auth.css';
import AuthLayout from './components/AuthLayout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Forgot from './pages/auth/Forgot';
import Reset from './pages/auth/Reset';
import Home from './pages/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreatePost from './pages/posts/CreatePost';
import MyPosts from './pages/posts/MyPosts';
import PostsIndex from './pages/posts/PostsIndex';
import PostDetails from './pages/posts/PostDetails';

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
            <Route path="reset" element={<Reset />} />
          </Route>
          <Route path="/home" element={<Home />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/posts" element={<PostsIndex />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/posts/create" element={<CreatePost />} />
          <Route path="/posts/my-posts" element={<MyPosts />} />
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;