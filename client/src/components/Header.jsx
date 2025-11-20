import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/auth/loginSlice.js';
import NotificationsDropdown from './NotificationsDropdown';
import styles from "../assets/css/Header.module.css";

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

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);

  const user = useSelector((state) => state.login.user || state.profile.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate('/auth/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Posts', path: '/posts' },
    { name: 'Events', path: '/events' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className={styles.header}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-black">
              Community<span className="text-gray-700">Connect</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-black bg-gray-100' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}
              >
                {link.name}
              </NavLink>
            ))}

            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 text-sm font-medium text-gray-700 hover:text-black transition"
                >
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.username} className="w-9 h-9 rounded-full object-cover border-2 border-gray-300" />
                  ) : (
                    <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden lg:block">{user.username}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <NavLink to="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Profile
                    </NavLink>
                    <NavLink to="/posts/my-posts" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Posts
                    </NavLink>
                    <NavLink to="/events/my-events" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Events
                    </NavLink>
                    <div className="border-t border-gray-200 mt-1 pt-1">
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/auth/login" className={`${styles.buttonSecondary} ml-4`}>Login</Link>
                <Link to="/auth/signup" className={`${styles.buttonPrimary} ml-2`}>Sign Up</Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-black transition-colors duration-200"
            >
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

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
                <div className="flex items-center space-x-3 px-3 py-2">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.username} className="w-10 h-10 rounded-full object-cover border-2 border-gray-300" />
                  ) : (
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{user.username}</span>
                </div>
                <NavLink to="/profile" className="block py-2 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>My Profile</NavLink>
                <NavLink to="/posts/my-posts" className="block py-2 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>My Posts</NavLink>
                <NavLink to="/events/my-events" className="block py-2 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>My Events</NavLink>
                <NavLink to="/events/calendar" className="block py-2 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-md" onClick={() => setMobileMenuOpen(false)}>Events Calendar</NavLink>
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