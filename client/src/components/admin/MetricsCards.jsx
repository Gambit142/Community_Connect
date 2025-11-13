import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

const MetricsCards = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="w-3/4 h-8 bg-gray-200 rounded mb-2"></div>
            <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group"
        >
          {/* Gradient accent */}
          <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.gradient}`}></div>
          
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.color} bg-gradient-to-br ${stat.gradient} shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
              <FontAwesomeIcon icon={stat.icon} className="h-5 w-5 text-white" />
            </div>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              stat.changeType === 'positive' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              <FontAwesomeIcon 
                icon={stat.changeType === 'positive' ? faArrowUp : faArrowDown} 
                className="h-3 w-3" 
              />
              <span>{stat.change}</span>
            </div>
          </div>
          
          <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
          <p className="text-sm font-semibold text-gray-900">{stat.label}</p>
          <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;