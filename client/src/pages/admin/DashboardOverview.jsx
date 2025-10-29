// src/pages/admin/DashboardOverview.jsx

import React from 'react';
import styles from '../../assets/css/DashboardOverview.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faNewspaper, faCalendarAlt, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// --- ALL MOCK DATA & CHART CONFIGS ARE NOW OUTSIDE THE COMPONENT ---
// This ensures they are created only ONCE and do not change on re-renders.

const stats = [
  { label: 'Total Users', value: '1,257', icon: faUsers, color: 'bg-blue-500' },
  { label: 'Total Posts', value: '874', icon: faNewspaper, color: 'bg-green-500' },
  { label: 'Total Events', value: '129', icon: faCalendarAlt, color: 'bg-yellow-500' },
  { label: 'Pending Approval', value: '15', icon: faExclamationCircle, color: 'bg-red-500' },
];

const barChartData = {
  labels: ['June', 'July', 'August', 'September', 'October'],
  datasets: [{
    label: 'New Users',
    data: [65, 59, 80, 81, 95],
    backgroundColor: '#05213C',
    borderRadius: 4,
  }],
};

const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Explicitly disable animation to be certain
};

const doughnutChartData = {
  labels: ['Food', 'Tutoring', 'Ridesharing', 'Jobs', 'Housing'],
  datasets: [{
    data: [300, 50, 100, 80, 120],
    backgroundColor: ['#1E40AF', '#10B981', '#F59E0B', '#EF4444', '#6366F1'],
    hoverBackgroundColor: ['#1D4ED8', '#059669', '#D97706', '#DC2626', '#4F46E5'],
    borderWidth: 0,
  }],
};

const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Explicitly disable animation
};

const recentActivity = [
    { type: 'post', text: 'John Doe submitted a new post for approval.', time: '2m ago' },
    { type: 'user', text: 'Jane Smith created a new account.', time: '1h ago' },
    { type: 'event', text: 'Community Cleanup Day was approved.', time: '3h ago' },
];

// --- THE COMPONENT FUNCTION STARTS HERE ---
export default function DashboardOverview() {
  return (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      <p className="mt-2 text-gray-600 mb-8">Welcome to your admin dashboard</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${stat.color}`}>
              <FontAwesomeIcon icon={stat.icon} className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className={styles.statValue}>{stat.value}</p>
              <p className={styles.statLabel}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className={`${styles.chartContainer} lg:col-span-3`}>
          <h2 className={styles.chartTitle}>New User Signups</h2>
          <div style={{ height: '300px' }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
        <div className={`${styles.chartContainer} lg:col-span-2`}>
          <h2 className={styles.chartTitle}>Post Categories</h2>
          <div style={{ height: '300px' }}>
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className={styles.activityList}>
            {recentActivity.map((activity, index) => (
                <div key={index} className={styles.activityItem}>
                    <div className={`${styles.activityIcon} ${activity.type === 'post' ? 'bg-green-500' : activity.type === 'user' ? 'bg-blue-500' : 'bg-yellow-500'}`}>
                        <FontAwesomeIcon icon={activity.type === 'post' ? faNewspaper : activity.type === 'user' ? faUsers : faCalendarAlt} size="sm" />
                    </div>
                    <p className={styles.activityText}>{activity.text}</p>
                    <span className={styles.activityTime}>{activity.time}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}