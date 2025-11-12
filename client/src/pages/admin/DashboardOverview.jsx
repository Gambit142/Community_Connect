// src/pages/admin/DashboardOverview.jsx
import React, { useEffect } from 'react';
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
  faComments
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
      description: 'Registered users'
    },
    {
      label: 'Active Users',
      value: metrics.activeUsers.value.toLocaleString(),
      change: metrics.activeUsers.change,
      changeType: metrics.activeUsers.changeType,
      icon: faUserCheck,
      color: 'bg-green-500',
      description: 'Last 30 days'
    },
    {
      label: 'Total Posts',
      value: metrics.totalPosts.value.toLocaleString(),
      change: metrics.totalPosts.change,
      changeType: metrics.totalPosts.changeType,
      icon: faNewspaper,
      color: 'bg-purple-500',
      description: 'All time posts'
    },
    {
      label: 'Total Events',
      value: metrics.totalEvents.value.toLocaleString(),
      change: metrics.totalEvents.change,
      changeType: metrics.totalEvents.changeType,
      icon: faCalendarAlt,
      color: 'bg-amber-500',
      description: 'Created events'
    },
    {
      label: 'Event Participation',
      value: metrics.eventParticipation.value.toLocaleString(),
      change: metrics.eventParticipation.change,
      changeType: metrics.eventParticipation.changeType,
      icon: faEye,
      color: 'bg-indigo-500',
      description: 'Total participants'
    },
    {
      label: 'Flagged Comments',
      value: metrics.flaggedComments.value.toLocaleString(),
      change: metrics.flaggedComments.change,
      changeType: metrics.flaggedComments.changeType,
      icon: faFlag,
      color: 'bg-red-500',
      description: 'Requiring review'
    },
  ];
};

const getDynamicUserGrowthData = (charts) => {
  if (!charts?.userGrowth) return { labels: [], datasets: [] };
  return charts.userGrowth;
};

const getDynamicEngagementData = (charts) => {
  if (!charts?.engagement) return { labels: [], datasets: [] };
  return charts.engagement;
};

const getDynamicActivityMetricsData = (charts) => {
  if (!charts?.activityMetrics) return { labels: [], datasets: [] };
  return charts.activityMetrics;
};

// Unchanged chart options
const userGrowthOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      }
    },
    x: {
      grid: {
        display: false,
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
    }
  },
  cutout: '65%',
};
const activityMetricsOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      }
    },
    y: {
      beginAtZero: true,
    }
  },
};

// Unchanged recent activity mock and helpers
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
    case 'post': return 'bg-purple-500';
    case 'user': return 'bg-blue-500';
    case 'event': return 'bg-amber-500';
    case 'comment': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

// --- THE COMPONENT FUNCTION ---
export default function DashboardOverview() {
  const dispatch = useDispatch();
  const { analytics, analyticsLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAnalytics());
  }, [dispatch]);

  // Dynamic data only
  const stats = getDynamicStats(analytics?.metrics);
  const userGrowthData = getDynamicUserGrowthData(analytics?.charts);
  const engagementData = getDynamicEngagementData(analytics?.charts);
  const activityMetricsData = getDynamicActivityMetricsData(analytics?.charts);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">Comprehensive overview of platform metrics and user engagement</p>
      </div>
      {/* Key Metrics Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <FontAwesomeIcon icon={stat.icon} className="h-5 w-5 text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{stat.label}</p>
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
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600">New Users</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Active Users</span>
              </div>
            </div>
          </div>
          <div style={{ height: '350px' }}>
            <Line data={userGrowthData} options={userGrowthOptions} />
          </div>
        </div>
        {/* Engagement Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Content Distribution</h2>
          <div style={{ height: '300px' }}>
            <Doughnut data={engagementData} options={engagementOptions} />
          </div>
        </div>
        {/* Weekly Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Activity</h2>
          <div style={{ height: '300px' }}>
            <Bar data={activityMetricsData} options={activityMetricsOptions} />
          </div>
        </div>
      </div>
      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  <FontAwesomeIcon icon={getActivityIcon(activity.type)} className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-gray-500">By {activity.user}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Health</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">System Uptime</p>
                <p className="text-2xl font-bold text-blue-600">99.9%</p>
              </div>
              <FontAwesomeIcon icon={faChartLine} className="h-8 w-8 text-blue-500" />
            </div>
           
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900">Avg. Response Time</p>
                <p className="text-2xl font-bold text-green-600">128ms</p>
              </div>
              <FontAwesomeIcon icon={faUserCheck} className="h-8 w-8 text-green-500" />
            </div>
           
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-amber-900">Active Sessions</p>
                <p className="text-2xl font-bold text-amber-600">342</p>
              </div>
              <FontAwesomeIcon icon={faEye} className="h-8 w-8 text-amber-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}