import { createSlice } from '@reduxjs/toolkit';
import { getPendingPosts } from './getPendingPostsThunk.js';
import { approvePost } from './approvePostThunk.js';
import { rejectPost } from './rejectPostThunk.js';
import { getPendingEvents } from './getPendingEventsThunk.js';
import { approveEvent } from './approveEventThunk.js';
import { rejectEvent } from './rejectEventThunk.js';
import { getOrders } from './getOrdersThunk.js';
import { getFlaggedComments } from './getFlaggedCommentsThunk.js';
import { unflagComment } from './unflagCommentThunk.js';
import { deleteFlaggedComment } from './deleteFlaggedCommentThunk.js';
import { getAnalytics } from './getAnalyticsThunk.js';
import { exportAnalytics } from './exportAnalyticsThunk.js';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    // Posts state
    posts: [], // Now array for current page
    postPagination: null,
    postLoading: false,
    postError: null,
    postFilters: { search: '', page: 1, limit: 10 },

    // Events state (new)
    events: [],
    eventPagination: null,
    eventLoading: false,
    eventError: null,
    eventFilters: { search: '', page: 1, limit: 10 },

    // Orders state (new)
    orders: [],
    orderPagination: null, // If paginated later
    orderLoading: false,
    orderError: null,
    orderFilters: { eventId: '', status: '', page: 1, limit: 20 },

    // Flagged Comments state
    flaggedComments: [],
    flaggedPagination: null,
    flaggedLoading: false,
    flaggedError: null,
    flaggedFilters: { page: 1, limit: 20 },

    // Analytics state
    analytics: null,
    analyticsLoading: false,
    analyticsError: null,

    // Export state
    exportLoading: false,
    exportError: null,
    exportSuccess: null,
  },
  reducers: {
    // Posts reducers
    setPostFilters: (state, action) => {
      state.postFilters = { ...state.postFilters, ...action.payload };
      state.postPagination = null; // Reset pagination
    },
    clearPostError: (state) => {
      state.postError = null;
    },

    // Events reducers
    setEventFilters: (state, action) => {
      state.eventFilters = { ...state.eventFilters, ...action.payload };
      state.eventPagination = null; // Reset pagination
    },
    clearEventError: (state) => {
      state.eventError = null;
    },

    // Orders reducers
    setOrderFilters: (state, action) => {
      state.orderFilters = { ...state.orderFilters, ...action.payload };
      state.orderPagination = null;
    },
    clearOrderError: (state) => {
      state.orderError = null;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.orderPagination = null;
    },

    // Flagged Comments reducers
    setFlaggedFilters: (state, action) => {
      state.flaggedFilters = { ...state.flaggedFilters, ...action.payload };
      state.flaggedPagination = null;
    },
    clearFlaggedError: (state) => {
      state.flaggedError = null;
    },
    clearFlaggedComments: (state) => {
      state.flaggedComments = [];
      state.flaggedPagination = null;
    },

    // Analytics reducers
    clearAnalyticsError: (state) => {
      state.analyticsError = null;
    },

    // Export reducers
    clearExportState: (state) => {
      state.exportError = null;
      state.exportSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Pending Posts
      .addCase(getPendingPosts.pending, (state) => {
        state.postLoading = true;
        state.postError = null;
      })
      .addCase(getPendingPosts.fulfilled, (state, action) => {
        state.postLoading = false;
        state.posts = action.payload.posts;
        state.postPagination = action.payload.pagination;
      })
      .addCase(getPendingPosts.rejected, (state, action) => {
        state.postLoading = false;
        state.postError = action.payload;
        state.posts = [];
      })

      // Approve Post
      .addCase(approvePost.pending, (state) => {
        state.postLoading = true;
        state.postError = null;
      })
      .addCase(approvePost.fulfilled, (state, action) => {
        state.postLoading = false;
        const index = state.posts.findIndex(p => p._id === action.meta.arg);
        if (index !== -1) {
          state.posts[index].status = 'Published';
        }
      })
      .addCase(approvePost.rejected, (state, action) => {
        state.postLoading = false;
        state.postError = action.payload;
      })

      // Reject Post
      .addCase(rejectPost.pending, (state) => {
        state.postLoading = true;
        state.postError = null;
      })
      .addCase(rejectPost.fulfilled, (state, action) => {
        state.postLoading = false;
        const index = state.posts.findIndex(p => p._id === action.meta.arg);
        if (index !== -1) {
          state.posts[index].status = 'Rejected';
        }
      })
      .addCase(rejectPost.rejected, (state, action) => {
        state.postLoading = false;
        state.postError = action.payload;
      })

      // Get Pending Events
      .addCase(getPendingEvents.pending, (state) => {
        state.eventLoading = true;
        state.eventError = null;
      })
      .addCase(getPendingEvents.fulfilled, (state, action) => {
        state.eventLoading = false;
        state.events = action.payload.events;
        state.eventPagination = action.payload.pagination;
      })
      .addCase(getPendingEvents.rejected, (state, action) => {
        state.eventLoading = false;
        state.eventError = action.payload;
        state.events = [];
      })

      // Approve Event
      .addCase(approveEvent.pending, (state) => {
        state.eventLoading = true;
        state.eventError = null;
      })
      .addCase(approveEvent.fulfilled, (state, action) => {
        state.eventLoading = false;
        const index = state.events.findIndex(e => e._id === action.meta.arg);
        if (index !== -1) {
          state.events[index].status = 'Published';
        }
      })
      .addCase(approveEvent.rejected, (state, action) => {
        state.eventLoading = false;
        state.eventError = action.payload;
      })

      // Reject Event
      .addCase(rejectEvent.pending, (state) => {
        state.eventLoading = true;
        state.eventError = null;
      })
      .addCase(rejectEvent.fulfilled, (state, action) => {
        state.eventLoading = false;
        const index = state.events.findIndex(e => e._id === action.meta.arg);
        if (index !== -1) {
          state.events[index].status = 'Rejected';
        }
      })
      .addCase(rejectEvent.rejected, (state, action) => {
        state.eventLoading = false;
        state.eventError = action.payload;
      })

      // Get Orders
      .addCase(getOrders.pending, (state) => {
        state.orderLoading = true;
        state.orderError = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.orders = action.payload.orders;
        state.orderPagination = action.payload.pagination;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.orderLoading = false;
        state.orderError = action.payload;
        state.orders = [];
      })

      // Get Flagged Comments
      .addCase(getFlaggedComments.pending, (state) => {
        state.flaggedLoading = true;
        state.flaggedError = null;
      })
      .addCase(getFlaggedComments.fulfilled, (state, action) => {
        state.flaggedLoading = false;
        state.flaggedComments = action.payload.flaggedComments;
        state.flaggedPagination = action.payload.pagination;
      })
      .addCase(getFlaggedComments.rejected, (state, action) => {
        state.flaggedLoading = false;
        state.flaggedError = action.payload;
        state.flaggedComments = [];
      })

      // Unflag Comment
      .addCase(unflagComment.pending, (state) => {
        state.flaggedLoading = true;
        state.flaggedError = null;
      })
      .addCase(unflagComment.fulfilled, (state, action) => {
        state.flaggedLoading = false;
        // Remove from flagged list if present
        state.flaggedComments = state.flaggedComments.filter(c => c._id !== action.meta.arg);
      })
      .addCase(unflagComment.rejected, (state, action) => {
        state.flaggedLoading = false;
        state.flaggedError = action.payload;
      })

      // Delete Flagged Comment
      .addCase(deleteFlaggedComment.pending, (state) => {
        state.flaggedLoading = true;
        state.flaggedError = null;
      })
      .addCase(deleteFlaggedComment.fulfilled, (state, action) => {
        state.flaggedLoading = false;
        // Remove from flagged list
        state.flaggedComments = state.flaggedComments.filter(c => c._id !== action.meta.arg);
      })
      .addCase(deleteFlaggedComment.rejected, (state, action) => {
        state.flaggedLoading = false;
        state.flaggedError = action.payload;
      })

      // Get Analytics
      .addCase(getAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(getAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(getAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload;
        state.analytics = null;
      })

      // Export Analytics
      .addCase(exportAnalytics.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
        state.exportSuccess = null;
      })
      .addCase(exportAnalytics.fulfilled, (state, action) => {
        state.exportLoading = false;
        state.exportSuccess = `Exported as ${action.payload.format.toUpperCase()} successfully`;
      })
      .addCase(exportAnalytics.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload;
      });
  },
});

// Posts exports
export const { setPostFilters, clearPostError } = adminSlice.actions;
export { getPendingPosts } from './getPendingPostsThunk.js';
export { approvePost } from './approvePostThunk.js';
export { rejectPost } from './rejectPostThunk.js';

// Events exports 
export const { setEventFilters, clearEventError } = adminSlice.actions;
export { getPendingEvents } from './getPendingEventsThunk.js';
export { approveEvent } from './approveEventThunk.js';
export { rejectEvent } from './rejectEventThunk.js';

// Orders export
export const { setOrderFilters, clearOrderError, clearOrders } = adminSlice.actions;
export { getOrders } from './getOrdersThunk.js';

// Flagged Comments exports
export const { setFlaggedFilters, clearFlaggedError, clearFlaggedComments } = adminSlice.actions;
export { getFlaggedComments } from './getFlaggedCommentsThunk.js';
export { unflagComment } from './unflagCommentThunk.js';
export { deleteFlaggedComment } from './deleteFlaggedCommentThunk.js';

//  Analytics exports
export const { clearAnalyticsError } = adminSlice.actions;
export { getAnalytics } from './getAnalyticsThunk.js';

// Export exports
export const { clearExportState } = adminSlice.actions;
export { exportAnalytics } from './exportAnalyticsThunk.js';

export default adminSlice.reducer;