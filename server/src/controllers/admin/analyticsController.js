// server/src/controllers/admin/analyticsController.js
const User = require('../../models/User.js');
const Post = require('../../models/Post.js');
const Event = require('../../models/Event.js');
const Comment = require('../../models/Comment.js');
const Order = require('../../models/Order.js'); // Assuming Order model exists with timestamps and 'tickets' field as number

const getAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    // Total Users
    const totalUsers = await User.countDocuments({});
    const totalUsersThen = await User.countDocuments({ createdAt: { $lt: thirtyDaysAgo } });
    const usersGrowth = totalUsersThen > 0 ? Math.round(((totalUsers - totalUsersThen) / totalUsersThen) * 100) : (totalUsers > 0 ? 100 : 0);
    const usersChangeType = usersGrowth >= 0 ? 'positive' : 'negative';

    // Active Users (updatedAt in last 30 days)
    const activeUsers = await User.countDocuments({ updatedAt: { $gte: thirtyDaysAgo } });
    const prevActiveUsers = await User.countDocuments({ updatedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });
    const activeGrowth = prevActiveUsers > 0 ? Math.round(((activeUsers - prevActiveUsers) / prevActiveUsers) * 100) : (activeUsers > 0 ? 100 : 0);
    const activeChangeType = activeGrowth >= 0 ? 'positive' : 'negative';

    // Total Posts (Published)
    const totalPosts = await Post.countDocuments({ status: 'Published' });
    const totalPostsThen = await Post.countDocuments({ status: 'Published', createdAt: { $lt: thirtyDaysAgo } });
    const postsGrowth = totalPostsThen > 0 ? Math.round(((totalPosts - totalPostsThen) / totalPostsThen) * 100) : (totalPosts > 0 ? 100 : 0);
    const postsChangeType = postsGrowth >= 0 ? 'positive' : 'negative';

    // Total Events (Published)
    const totalEvents = await Event.countDocuments({ status: 'Published' });
    const totalEventsThen = await Event.countDocuments({ status: 'Published', createdAt: { $lt: thirtyDaysAgo } });
    const eventsGrowth = totalEventsThen > 0 ? Math.round(((totalEvents - totalEventsThen) / totalEventsThen) * 100) : (totalEvents > 0 ? 100 : 0);
    const eventsChangeType = eventsGrowth >= 0 ? 'positive' : 'negative';

    // Event Participation (sum of tickets across completed orders) - Fixed: assuming tickets is a number, not array
    const totalParticipationAgg = await Order.aggregate([
      { $match: { status: 'completed' } }, // Adjust 'completed' if status differs
      { $group: { _id: null, total: { $sum: '$tickets' } } }
    ]);
    const eventParticipation = totalParticipationAgg[0]?.total || 0;

    const newParticipationAgg = await Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$tickets' } } }
    ]);
    const newParticipation = newParticipationAgg[0]?.total || 0;
    const participationThen = eventParticipation - newParticipation;
    const participationGrowth = participationThen > 0 ? Math.round(((newParticipation) / participationThen) * 100) : (eventParticipation > 0 ? 100 : 0);
    const participationChangeType = participationGrowth >= 0 ? 'positive' : 'negative';

    // Flagged Comments
    const flaggedComments = await Comment.countDocuments({ flags: { $exists: true, $ne: [] }, deleted: false });
    const newFlaggedLast30 = await Comment.countDocuments({ flags: { $exists: true, $ne: [] }, deleted: false, updatedAt: { $gte: thirtyDaysAgo } });
    const flaggedThen = flaggedComments - newFlaggedLast30;
    const flaggedGrowth = flaggedThen > 0 ? Math.round(((newFlaggedLast30) / flaggedThen) * 100) : (flaggedComments > 0 ? 100 : 0);
    const flaggedChangeType = flaggedGrowth >= 0 ? 'positive' : 'negative';

    // User Growth Chart (last 10 months)
    const now = new Date();
    const months = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().slice(0, 7));
    }
    const labels = months.map(m => new Date(`${m}-01`).toLocaleDateString('en-US', { month: 'short' }));

    // New Users per month
    const newUsersAgg = await User.aggregate([
      { $addFields: { yearMonth: { $dateToString: { format: '%Y-%m', date: '$createdAt' } } } },
      { $group: { _id: '$yearMonth', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const newUsersMap = new Map(newUsersAgg.map(g => [g._id, g.count]));
    const newUsersData = months.map(m => newUsersMap.get(m) || 0);

    // Active Users per month (updatedAt)
    const activeUsersAgg = await User.aggregate([
      { $addFields: { yearMonth: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } } } },
      { $group: { _id: '$yearMonth', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const activeUsersMap = new Map(activeUsersAgg.map(g => [g._id, g.count]));
    const activeUsersChartData = months.map(m => activeUsersMap.get(m) || 0);

    const userGrowthDatasets = [
      {
        label: 'New Users',
        data: newUsersData,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3B82F6',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Active Users',
        data: activeUsersChartData,
        borderColor: '#10B981',
        borderWidth: 3,
        tension: 0.4,
        fill: false,
      }
    ];

    // Engagement (Post categories, top 6)
    const postCategoriesAgg = await Post.aggregate([
      { $match: { status: 'Published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);
    const postCatLabels = postCategoriesAgg.map(g => g._id.charAt(0).toUpperCase() + g._id.slice(1));
    const postCatData = postCategoriesAgg.map(g => g.count);

    // Event categories (top 6, new)
    const eventCategoriesAgg = await Event.aggregate([
      { $match: { status: 'Published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);
    const eventCatLabels = eventCategoriesAgg.map(g => g._id.charAt(0).toUpperCase() + g._id.slice(1));
    const eventCatData = eventCategoriesAgg.map(g => g.count);

    // For now, keep post-based for engagement chart; add event to response for potential frontend use
    const engagementDatasets = [{
      data: postCatData,
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
      hoverBackgroundColor: ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2'],
      borderWidth: 0,
      spacing: 2,
    }];

    // Weekly Activity (last 7 days)
    const dayLabels = [];
    const postsPerDay = [];
    const commentsPerDay = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dayLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      const postCount = await Post.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd }, status: 'Published' });
      postsPerDay.push(postCount);
      const commentCount = await Comment.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd }, deleted: false });
      commentsPerDay.push(commentCount);
    }
    const activityMetricsDatasets = [
      {
        label: 'Posts Created',
        data: postsPerDay,
        backgroundColor: '#8B5CF6',
        borderRadius: 6,
      },
      {
        label: 'Comments Posted',
        data: commentsPerDay,
        backgroundColor: '#3B82F6',
        borderRadius: 6,
      }
    ];

    res.status(200).json({
      metrics: {
        totalUsers: { value: totalUsers, change: `+${usersGrowth}%`, changeType: usersChangeType },
        activeUsers: { value: activeUsers, change: `+${activeGrowth}%`, changeType: activeChangeType },
        totalPosts: { value: totalPosts, change: `+${postsGrowth}%`, changeType: postsChangeType },
        totalEvents: { value: totalEvents, change: `+${eventsGrowth}%`, changeType: eventsChangeType },
        eventParticipation: { value: eventParticipation, change: `+${participationGrowth}%`, changeType: participationChangeType },
        flaggedComments: { value: flaggedComments, change: `+${flaggedGrowth}%`, changeType: flaggedChangeType },
      },
      charts: {
        userGrowth: { labels, datasets: userGrowthDatasets },
        engagement: { 
          post: { labels: postCatLabels, datasets: engagementDatasets },
          event: { labels: eventCatLabels, datasets: [{ data: eventCatData }] }
        },
        activityMetrics: { labels: dayLabels, datasets: activityMetricsDatasets },
      },
      recentActivity: [], // Can extend later with recent queries
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
};

module.exports = { getAnalytics };