import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/auth/loginSlice.js';
import styles from "../assets/css/Header.module.css";

// SVG Icons for better UI
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// NEW: Bell Icon for notifications
const BellIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
);

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false); // NEW: State for notifications
  
  const user = useSelector((state) => state.login.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profileRef = useRef(null); // Ref for detecting outside clicks
  const notificationRef = useRef(null); // NEW: Ref for notifications dropdown

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate('/auth/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Posts', path: '/posts' },
    { name: 'Events', path: '/events' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className={styles.header}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-black">
              Community<span className="text-gray-700">Connect</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right side controls for Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Notification Icon */}
                <div className="relative" ref={notificationRef}>
                  <button onClick={() => setNotificationOpen(!isNotificationOpen)} className="relative text-gray-600 hover:text-black focus:outline-none">
                    <BellIcon />
                    {/* Notification Badge */}
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 ring-2 ring-white"></span>
                  </button>
                  {isNotificationOpen && (
                    <div className={styles.profileDropdown}> {/* Reusing profile dropdown style */}
                        <div className="px-4 py-2 border-b border-gray-200">
                            <p className="text-sm font-semibold text-gray-900">Notifications</p>
                        </div>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your post was approved.</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">New comment on your event.</a>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full text-gray-700 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                    {user.username?.charAt(0).toUpperCase()}
                  </button>
                  {isProfileOpen && (
                    <div className={styles.profileDropdown}>
                      {/* ... existing profile dropdown content ... */}
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <NavLink to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setProfileOpen(false)}>My Profile</NavLink>
                      <NavLink to="/posts/my-posts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setProfileOpen(false)}>My Posts</NavLink>
                      <NavLink to="/events/my-events" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setProfileOpen(false)}>My Events</NavLink>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-x-2">
                <Link to="/auth/login" className={styles.buttonSecondary}>Login</Link>
                <Link to="/auth/signup" className={styles.buttonPrimary}>Sign Up</Link>
              </div>
            )}
          </div>
          
          {/* Right side controls for Mobile */}
          <div className="md:hidden flex items-center space-x-4">
            {user && (
              /* Notification Icon for Mobile */
              <div className="relative" ref={notificationRef}>
                <button onClick={() => setNotificationOpen(!isNotificationOpen)} className="relative text-gray-600 hover:text-black focus:outline-none">
                  <BellIcon />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 ring-2 ring-white"></span>
                </button>
                {isNotificationOpen && (
                    <div className={styles.profileDropdown}>
                        <div className="px-4 py-2 border-b border-gray-200">
                            <p className="text-sm font-semibold text-gray-900">Notifications</p>
                        </div>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your post was approved.</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">New comment on your event.</a>
                    </div>
                )}
              </div>
            )}
            {/* Mobile Menu (Hamburger) Button */}
            <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? 'scale-y-100' : 'scale-y-0'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {link.name}
            </NavLink>
          ))}
          <div className="border-t border-gray-200 pt-4 mt-4">
            {user ? (
              <div className="px-3 space-y-2">
                <NavLink to="/profile" className="block py-2 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>My Profile</NavLink>
                <NavLink to="/posts/my-posts" className="block py-2 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>My Posts</NavLink>
                <NavLink to="/events/my-events" className="block py-2 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>My Events</NavLink>
                <button onClick={handleLogout} className="w-full text-left py-2 text-base font-medium text-red-600 hover:bg-gray-50 rounded-md">
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-3 space-y-2">
                <Link to="/auth/login" className={`${styles.buttonSecondary} w-full block text-center`} onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/auth/signup" className={`${styles.buttonPrimary} w-full block text-center mt-2`} onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}