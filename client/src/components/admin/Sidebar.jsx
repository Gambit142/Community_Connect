import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faEnvelope,
  faUsers,
  faNewspaper,
  faCalendarAlt,
  faTable,
  faCog,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const menuItems = [
  { path: '/admin', icon: faChartPie, label: 'Overview' },
  { path: '/admin/messages', icon: faEnvelope, label: 'Messages' },
  { path: '/admin/users', icon: faUsers, label: 'User Profiles' },
  { path: '/admin/posts', icon: faNewspaper, label: 'Posts' },
  { path: '/admin/events', icon: faCalendarAlt, label: 'Events' },
  { path: '/admin/tables', icon: faTable, label: 'Tables' },
  { path: '/admin/settings', icon: faCog, label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    
    return (
      <Link
        to={item.path}
        className={`flex items-center px-6 py-4 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 ${
          isActive ? 'bg-gray-700 text-white border-r-4 border-white' : ''
        }`}
        onClick={onClose}
      >
        <FontAwesomeIcon icon={item.icon} className="w-5 h-5 mr-4" />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#05213C] shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <span className="text-xl font-bold text-white">Admin Dashboard</span>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>
      </div>
    </>
  );
}