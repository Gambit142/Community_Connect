import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAnalytics } from '../../store/admin/adminSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faNewspaper,
  faCalendarAlt,
  faUserCheck,
  faChartLine,
  faFlag,
  faEye,
  faSync
} from '@fortawesome/free-solid-svg-icons';

// Import subcomponents
import MetricsCards from '../../components/admin/MetricsCards';
import DashboardCharts from '../../components/admin/DashboardCharts';
import ActivityHealthSection from '../../components/admin/ActivityHealthSection';

// Import Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

// --- DYNAMIC DATA TRANSFORMATION FUNCTIONS ---
const getDynamicStats = (metrics) => {
  if (!metrics) return [];
  return [
    {
      label: 'Total Users',
      value: metrics.totalUsers?.value?.toLocaleString() || '0',
      change: metrics.totalUsers?.change || '+0%',
      changeType: metrics.totalUsers?.changeType || 'positive',
      icon: faUsers,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      description: 'Registered users'
    },
    {
      label: 'Active Users',
      value: metrics.activeUsers?.value?.toLocaleString() || '0',
      change: metrics.activeUsers?.change || '+0%',
      changeType: metrics.activeUsers?.changeType || 'positive',
      icon: faUserCheck,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600',
      description: 'Last 30 days'
    },
    {
      label: 'Total Posts',
      value: metrics.totalPosts?.value?.toLocaleString() || '0',
      change: metrics.totalPosts?.change || '+0%',
      changeType: metrics.totalPosts?.changeType || 'positive',
      icon: faNewspaper,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
      description: 'All time posts'
    },
    {
      label: 'Total Events',
      value: metrics.totalEvents?.value?.toLocaleString() || '0',
      change: metrics.totalEvents?.change || '+0%',
      changeType: metrics.totalEvents?.changeType || 'positive',
      icon: faCalendarAlt,
      color: 'bg-amber-500',
      gradient: 'from-amber-500 to-amber-600',
      description: 'Created events'
    },
    {
      label: 'Event Participation',
      value: metrics.eventParticipation?.value?.toLocaleString() || '0',
      change: metrics.eventParticipation?.change || '+0%',
      changeType: metrics.eventParticipation?.changeType || 'positive',
      icon: faEye,
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600',
      description: 'Total participants'
    },
    {
      label: 'Flagged Comments',
      value: metrics.flaggedComments?.value?.toLocaleString() || '0',
      change: metrics.flaggedComments?.change || '+0%',
      changeType: metrics.flaggedComments?.changeType || 'positive',
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
  if (!charts?.engagement?.post) return { labels: [], datasets: [{ data: [] }] };
  return {
    labels: charts.engagement.post.labels,
    datasets: charts.engagement.post.datasets
  };
};

const getDynamicEventEngagementData = (charts) => {
  if (!charts?.engagement?.event) return { labels: [], datasets: [{ data: [] }] };
  
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

// Recent activity data
const recentActivity = [
  { type: 'post', text: 'New post "Community Garden Update" submitted for approval', user: 'John Doe', time: '2m ago' },
  { type: 'user', text: 'New user registration completed', user: 'Jane Smith', time: '1h ago' },
  { type: 'event', text: 'Event "Community Cleanup Day" was approved', user: 'Admin', time: '3h ago' },
  { type: 'comment', text: 'Comment flagged for review in "Local Job Opportunities"', user: 'System', time: '5h ago' },
  { type: 'event', text: '15 new participants joined "Weekly Tutoring Session"', user: 'System', time: '1d ago' },
];

// --- MAIN COMPONENT ---
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

  // Dynamic data transformation
  const stats = getDynamicStats(analytics?.metrics);
  const userGrowthData = getDynamicUserGrowthData(analytics?.charts);
  const postEngagementData = getDynamicPostEngagementData(analytics?.charts);
  const eventEngagementData = getDynamicEventEngagementData(analytics?.charts);
  const activityMetricsData = getDynamicActivityMetricsData(analytics?.charts);

  return (
    <div className="space-y-8">
      {/* Header with Export and Refresh */}
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
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleRefresh}
            disabled={analyticsLoading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <FontAwesomeIcon icon={faSync} className={`h-4 w-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <ExportButton />
        </div>
      </div>

      {/* Key Metrics Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Key Performance Indicators</h2>
          <span className="text-sm text-gray-500">Real-time metrics</span>
        </div>
        <MetricsCards stats={stats} loading={analyticsLoading} />
      </div>

      {/* Charts Section */}
      <DashboardCharts
        userGrowthData={userGrowthData}
        postEngagementData={postEngagementData}
        eventEngagementData={eventEngagementData}
        activityMetricsData={activityMetricsData}
        userGrowthOptions={userGrowthOptions}
        engagementOptions={engagementOptions}
        activityMetricsOptions={activityMetricsOptions}
        loading={analyticsLoading}
      />

      {/* Activity & Health Section */}
      <ActivityHealthSection 
        recentActivity={recentActivity}
        lastUpdated={lastUpdated}
      />
    </div>
  );
}