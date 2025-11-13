import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faNewspaper,
  faUsers,
  faCalendarAlt,
  faComments,
  faChartLine,
  faUserCheck,
  faEye,
  faRocket,
  faDatabase
} from '@fortawesome/free-solid-svg-icons';

const ActivityHealthSection = ({ recentActivity, lastUpdated }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'post': return faNewspaper;
      case 'user': return faUsers;
      case 'event': return faCalendarAlt;
      case 'comment': return faComments;
      default: return faChartLine;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'post': return 'bg-gradient-to-br from-purple-500 to-purple-600';
      case 'user': return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case 'event': return 'bg-gradient-to-br from-amber-500 to-amber-600';
      case 'comment': return 'bg-gradient-to-br from-red-500 to-red-600';
      default: return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  const platformMetrics = [
    { label: 'System Uptime', value: '99.9%', change: '+0.1%', icon: faRocket, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { label: 'Avg Response Time', value: '128ms', change: '-12ms', icon: faDatabase, color: 'bg-gradient-to-br from-green-500 to-green-600' },
    { label: 'Active Sessions', value: '342', change: '+23', icon: faUserCheck, color: 'bg-gradient-to-br from-amber-500 to-amber-600' },
    { label: 'Data Accuracy', value: '99.8%', change: '+0.2%', icon: faChartLine, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <span className="text-sm text-blue-600 font-medium">{recentActivity.length} items</span>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div 
              key={index} 
              className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200 group"
            >
              <div className={`p-3 rounded-lg ${getActivityColor(activity.type)} shadow-sm group-hover:shadow transition-shadow duration-200 flex-shrink-0`}>
                <FontAwesomeIcon icon={getActivityIcon(activity.type)} className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-relaxed">{activity.text}</p>
                <div className="flex items-center mt-2 space-x-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    By {activity.user}
                  </span>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Health */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Health</h2>
          <div className="space-y-4">
            {platformMetrics.map((metric, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${metric.color} shadow-sm group-hover:shadow transition-shadow duration-200`}>
                    <FontAwesomeIcon icon={metric.icon} className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Status */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Data Status</h3>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm text-blue-100 mb-2">All systems operational</p>
          <div className="flex items-center justify-between text-xs text-blue-200">
            <span>Last sync: {lastUpdated.toLocaleTimeString()}</span>
            <span>Live data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHealthSection;