import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store.js';
import './styles/auth.css';
// Auth imports
import AuthLayout from './components/AuthLayout';
import UserLayout from './components/UserLayout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Forgot from './pages/auth/Forgot';
import Reset from './pages/auth/Reset';
// Home import
import Home from './pages/Home';
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

          
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="posts" element={<Posts />} />
            <Route path="users" element={<UserProfiles />} />
            <Route path="messages" element={<Messages />} />
            <Route path="events" element={<Events />} />
            <Route path="tables" element={<Tables />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* User-facing routes wrapped in the new UserLayout */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Post Routes */}
            <Route path="/posts" element={<PostsIndex />} />
            <Route path="/posts/:id" element={<PostDetails />} />
            <Route path="/posts/create" element={<CreatePost />} />
            <Route path="/posts/my-posts" element={<MyPosts />} />
            
            {/* Event Routes */}
            <Route path="/events" element={<EventsIndex />} />
            <Route path="/events/create" element={<CreateEvent />} />
            <Route path="/events/my-events" element={<MyEvents />} />
            <Route path="/events/:id" element={<EventDetails />} />

            {/* Profile Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfile />} />
          </Route>


          <Route path="/" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;