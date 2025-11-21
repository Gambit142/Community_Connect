import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/auth/loginSlice.js';
import NotificationsDropdown from './NotificationsDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUser, faSignOutAlt, faFileAlt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import styles from "../assets/css/Header.module.css";

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

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Community<span className="text-blue-600">Connect</span>
              </span>
            </Link>
          </div>

          {/* Centered Navigation Links */}
          <div className="hidden md:flex md:flex-1 md:justify-center md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `relative px-3 py-2 text-sm font-medium transition-all duration-300 ${isActive
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                {link.name}
                {({ isActive }) => isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"></span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right Side: Notification + User */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            {user && (
              <div className="hidden sm:block">
                <NotificationsDropdown />
              </div>
            )}

            {/* User Avatar & Dropdown - Hidden on mobile, responsive on md+ */}
            {user ? (
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.username}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg shadow-md">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="hidden xl:flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-900">{user.username}</span>
                    <span className="text-xs text-gray-500">Member</span>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>

                    <NavLink
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faUser} className="w-4 h-4 mr-3 text-gray-400" />
                      My Profile
                    </NavLink>

                    <NavLink
                      to="/posts/my-posts"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 mr-3 text-gray-400" />
                      My Posts
                    </NavLink>

                    <NavLink
                      to="/events/my-events"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mr-3 text-gray-400" />
                      My Events
                    </NavLink>

                    <NavLink
                      to="/events/calendar"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mr-3 text-gray-400" />
                      Event Calendar
                    </NavLink>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link to="/auth/login" className={`${styles.buttonSecondary} px-6 py-2.5`}>
                  Login
                </Link>
                <Link to="/auth/signup" className={`${styles.buttonPrimary} px-6 py-2.5`}>
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button and mobile notification */}
            <div className="md:hidden flex items-center space-x-3">
              {user && (
                <div className="sm:hidden">
                  <NotificationsDropdown />
                </div>
              )}
              
              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              >
                {isMobileMenuOpen ?
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" /> :
                  <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                }
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'} md:hidden`}>
        <div className="px-4 pt-4 pb-6 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-base font-medium transition-all ${isActive
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* Mobile User Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            {user ? (
              <div className="px-4 space-y-3">
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                <NavLink
                  to="/profile"
                  className="flex items-center py-3 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-lg px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4 mr-3 text-gray-400" />
                  My Profile
                </NavLink>

                <NavLink
                  to="/posts/my-posts"
                  className="flex items-center py-3 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-lg px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 mr-3 text-gray-400" />
                  My Posts
                </NavLink>

                <NavLink
                  to="/events/my-events"
                  className="flex items-center py-3 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-lg px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mr-3 text-gray-400" />
                  My Events
                </NavLink>

                <NavLink
                  to="/events/calendar"
                  className="flex items-center py-3 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-lg px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mr-3 text-gray-400" />
                  Event Calendar
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg px-3"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-4 space-y-3">
                <Link
                  to="/auth/login"
                  className={`${styles.buttonSecondary} w-full block text-center py-3 rounded-xl`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/auth/signup"
                  className={`${styles.buttonPrimary} w-full block text-center py-3 rounded-xl mt-2`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}