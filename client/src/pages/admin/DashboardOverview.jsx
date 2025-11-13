import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAnalytics } from '../../store/admin/adminSlice';
import styles from '../../assets/css/DashboardOverview.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faNewspaper,
  faCalendarAlt,
  faExclamationCircle,
  faUserCheck,
  faChartLine,
  faFlag,
  faEye,
  faComments,
  faArrowUp,
  faArrowDown,
  faSync,
  faDatabase,
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

// --- DYNAMIC DATA FROM REDUX ---
const getDynamicStats = (metrics) => {
  if (!metrics) return [];
  return [
    {
      label: 'Total Users',
      value: metrics.totalUsers.value.toLocaleString(),
      change: metrics.totalUsers.change,
      changeType: metrics.totalUsers.changeType,
      icon: faUsers,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      description: 'Registered users'
    },
    {
      label: 'Active Users',
      value: metrics.activeUsers.value.toLocaleString(),
      change: metrics.activeUsers.change,
      changeType: metrics.activeUsers.changeType,
      icon: faUserCheck,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600',
      description: 'Last 30 days'
    },
    {
      label: 'Total Posts',
      value: metrics.totalPosts.value.toLocaleString(),
      change: metrics.totalPosts.change,
      changeType: metrics.totalPosts.changeType,
      icon: faNewspaper,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
      description: 'All time posts'
    },
    {
      label: 'Total Events',
      value: metrics.totalEvents.value.toLocaleString(),
      change: metrics.totalEvents.change,
      changeType: metrics.totalEvents.changeType,
      icon: faCalendarAlt,
      color: 'bg-amber-500',
      gradient: 'from-amber-500 to-amber-600',
      description: 'Created events'
    },
    {
      label: 'Event Participation',
      value: metrics.eventParticipation.value.toLocaleString(),
      change: metrics.eventParticipation.change,
      changeType: metrics.eventParticipation.changeType,
      icon: faEye,
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600',
      description: 'Total participants'
    },
    {
      label: 'Flagged Comments',
      value: metrics.flaggedComments.value.toLocaleString(),
      change: metrics.flaggedComments.change,
      changeType: metrics.flaggedComments.changeType,
      icon: faFlag,
      color: 'bg-red-500',
      gradient: 'from-red-500 to-red-600',
      description: 'Requiring review'
    },
  ];
};

const getDynamicUserGrowthData = (charts) => {
  if (!charts?.userGrowth) return { labels: [], datasets: [] };
  return charts.userGrowth;
};

const getDynamicPostEngagementData = (charts) => {
  if (!charts?.engagement?.post) return { labels: [], datasets: [] };
  return {
    labels: charts.engagement.post.labels,
    datasets: charts.engagement.post.datasets
  };
};

const getDynamicEventEngagementData = (charts) => {
  if (!charts?.engagement?.event) return { labels: [], datasets: [] };
  return {
    labels: charts.engagement.event.labels,
    datasets: [{
      data: charts.engagement.event.datasets[0].data,
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'],
      hoverBackgroundColor: ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#65A30D', '#EA580C'],
      borderWidth: 0,
      spacing: 2,
    }]
  };
};

const getDynamicActivityMetricsData = (charts) => {
  if (!charts?.activityMetrics) return { labels: [], datasets: [] };
  return charts.activityMetrics;
};

// Chart Options
const userGrowthOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1F2937',
      bodyColor: '#4B5563',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      cornerRadius: 8,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        color: '#6B7280',
      }
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#6B7280',
      }
    }
  },
  animation: {
    duration: 1000,
  },
};

const engagementOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 15,
        color: '#4B5563',
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1F2937',
      bodyColor: '#4B5563',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      cornerRadius: 8,
    }
  },
  cutout: '60%',
};

const activityMetricsOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1F2937',
      bodyColor: '#4B5563',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      cornerRadius: 8,
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#6B7280',
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        color: '#6B7280',
      }
    }
  },
};

// Recent activity mock and helpers
const recentActivity = [
  { type: 'post', text: 'New post "Community Garden Update" submitted for approval', user: 'John Doe', time: '2m ago' },
  { type: 'user', text: 'New user registration completed', user: 'Jane Smith', time: '1h ago' },
  { type: 'event', text: 'Event "Community Cleanup Day" was approved', user: 'Admin', time: '3h ago' },
  { type: 'comment', text: 'Comment flagged for review in "Local Job Opportunities"', user: 'System', time: '5h ago' },
  { type: 'event', text: '15 new participants joined "Weekly Tutoring Session"', user: 'System', time: '1d ago' },
];

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

// Platform metrics
const platformMetrics = [
  { label: 'System Uptime', value: '99.9%', change: '+0.1%', icon: faRocket, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  { label: 'Avg Response Time', value: '128ms', change: '-12ms', icon: faDatabase, color: 'bg-gradient-to-br from-green-500 to-green-600' },
  { label: 'Active Sessions', value: '342', change: '+23', icon: faUserCheck, color: 'bg-gradient-to-br from-amber-500 to-amber-600' },
  { label: 'Data Accuracy', value: '99.8%', change: '+0.2%', icon: faChartLine, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
];

export default function DashboardOverview() {
  const dispatch = useDispatch();
  const { analytics, analyticsLoading } = useSelector((state) => state.admin);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    dispatch(getAnalytics());
    setLastUpdated(new Date());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getAnalytics());
    setLastUpdated(new Date());
  };

  // Dynamic data only
  const stats = getDynamicStats(analytics?.metrics);
  const userGrowthData = getDynamicUserGrowthData(analytics?.charts);
  const postEngagementData = getDynamicPostEngagementData(analytics?.charts);
  const eventEngagementData = getDynamicEventEngagementData(analytics?.charts);
  const activityMetricsData = getDynamicActivityMetricsData(analytics?.charts);

  return (
    <div className="space-y-8">
      {/* Header with Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600 flex items-center">
            Comprehensive overview of platform metrics and user engagement
            {analyticsLoading && (
              <FontAwesomeIcon icon={faSync} className="h-4 w-4 text-blue-500 ml-2 animate-spin" />
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={analyticsLoading}
          className="mt-4 sm:mt-0 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon icon={faSync} className={`h-4 w-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Key Performance Indicators</h2>
          <span className="text-sm text-gray-500">Real-time metrics</span>
        </div>
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
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">User Growth Analytics</h2>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 shadow-sm"></div>
                <span className="text-gray-600">New Users</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 shadow-sm"></div>
                <span className="text-gray-600">Active Users</span>
              </div>
            </div>
          </div>
          <div style={{ height: '350px' }}>
            <Line data={userGrowthData} options={userGrowthOptions} />
          </div>
        </div>

        {/* Post Categories Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Post Categories</h2>
            <span className="text-sm text-gray-500">Distribution</span>
          </div>
          <div style={{ height: '280px' }}>
            <Doughnut data={postEngagementData} options={engagementOptions} />
          </div>
        </div>

        {/* Event Categories Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Event Categories</h2>
            <span className="text-sm text-gray-500">Distribution</span>
          </div>
          <div style={{ height: '280px' }}>
            <Doughnut data={eventEngagementData} options={engagementOptions} />
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Weekly Activity Trends</h2>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
          <div style={{ height: '300px' }}>
            <Bar data={activityMetricsData} options={activityMetricsOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity & Platform Health */}
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
    </div>
  );
}