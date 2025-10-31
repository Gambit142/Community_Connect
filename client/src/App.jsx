// Updated src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store.js';
import './styles/auth.css';

// LAYOUTS
import AuthLayout from './components/AuthLayout';
import UserLayout from './components/UserLayout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Forgot from './pages/auth/Forgot';
import Reset from './pages/auth/Reset';

// NEW STATIC & EVENT PAGES
import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';
import EventsIndex from './pages/events/EventsIndex';
import EventDetails from './pages/events/EventDetails';
import CreateEvent from './pages/events/CreateEvent';
import MyEvents from './pages/events/MyEvents';

// NEW PROFILE PAGES
import ProfilePage from './pages/profile/ProfilePage';
import EditProfile from './pages/profile/EditProfile';

// Post imports
import CreatePost from './pages/posts/CreatePost';
import EditPost from './pages/posts/EditPost';
import MyPosts from './pages/posts/MyPosts';
import PostsIndex from './pages/posts/PostsIndex';
import PostDetails from './pages/posts/PostDetails';

// Admin imports
import DashboardLayout from './pages/admin/DashboardLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import Posts from './pages/admin/Posts';
import UserProfiles from './pages/admin/UserProfiles';
import Messages from './pages/admin/Messages';
import Events from './pages/admin/Events';
import Tables from './pages/admin/Tables';
import Settings from './pages/admin/Settings';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Authentication routes with their own layout */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<Navigate to="login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="forgot" element={<Forgot />} />
            <Route path="reset" element={<Reset />} />
          </Route>

          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="posts" element={<Posts />} />
            <Route path="users" element={<UserProfiles />} />
            <Route path="messages" element={<Messages />} />
            <Route path="events" element={<Events />} />
            <Route path="tables" element={<Tables />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route element={<UserLayout />}>
            {/* Public routes - no auth required */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />     
            {/* Public Post Routes */}
            <Route path="/posts" element={<PostsIndex />} />
            <Route path="/posts/:id" element={<PostDetails />} />
            
            {/* Public Event Routes */}
            <Route path="/events" element={<EventsIndex />} />
            <Route path="/events/:id" element={<EventDetails />} />

            {/* Protected routes - require auth */}
            <Route path="/posts/create" element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } />
            <Route path="/posts/my-posts" element={
              <ProtectedRoute>
                <MyPosts />
              </ProtectedRoute>
            } />
            <Route path="/posts/edit/:id" element={
              <ProtectedRoute>
                <EditPost />
              </ProtectedRoute>
            } />
            
            <Route path="/events/create" element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            } />
            <Route path="/events/my-events" element={
              <ProtectedRoute>
                <MyEvents />
              </ProtectedRoute>
            } />

            {/* Protected Profile Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            } />
          </Route>

          {/* Catch-all redirect to login/signup */}
          <Route path="*" element={<Navigate to="/auth/signup" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;