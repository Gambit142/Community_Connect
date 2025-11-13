import React from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

const DashboardCharts = ({
  userGrowthData,
  postEngagementData,
  eventEngagementData,
  activityMetricsData,
  userGrowthOptions,
  engagementOptions,
  activityMetricsOptions,
  loading
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
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
  );
};

export default DashboardCharts;