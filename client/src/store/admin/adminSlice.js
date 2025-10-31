import { createSlice } from '@reduxjs/toolkit';
import { getPendingPosts } from './getPendingPostsThunk.js';
import { approvePost } from './approvePostThunk.js';
import { rejectPost } from './rejectPostThunk.js';
import { getPendingEvents } from './getPendingEventsThunk.js';
import { approveEvent } from './approveEventThunk.js';
import { rejectEvent } from './rejectEventThunk.js';
import { getOrders } from './getOrdersThunk.js';

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

    // Events reducers (new)
    setEventFilters: (state, action) => {
      state.eventFilters = { ...state.eventFilters, ...action.payload };
      state.eventPagination = null; // Reset pagination
    },
    clearEventError: (state) => {
      state.eventError = null;
    },

    // Orders reducers (new)
    setOrderFilters: (state, action) => {
      state.orderFilters = { ...state.orderFilters, ...action.payload };
      state.orderPagination = null; // Reset pagination
    },
    clearOrderError: (state) => {
      state.orderError = null;
    },
    clearOrders: (state) => {
      state.orders = [];
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
        state.posts = action.payload.posts; // Direct array
        state.postPagination = action.payload.pagination;
      })
      .addCase(getPendingPosts.rejected, (state, action) => {
        state.postLoading = false;
        state.postError = action.payload;
      })
      // Approve Post
      .addCase(approvePost.pending, (state) => {
        state.postLoading = true;
      })
      .addCase(approvePost.fulfilled, (state, action) => {
        state.postLoading = false;
        const { post } = action.payload;
        const index = state.posts.findIndex(p => p._id === post._id);
        if (index !== -1) {
          state.posts[index] = post;
        }
      })
      .addCase(approvePost.rejected, (state, action) => {
        state.postLoading = false;
        state.postError = action.payload;
      })
      // Reject Post
      .addCase(rejectPost.pending, (state) => {
        state.postLoading = true;
      })
      .addCase(rejectPost.fulfilled, (state, action) => {
        state.postLoading = false;
        const { post } = action.payload;
        const index = state.posts.findIndex(p => p._id === post._id);
        if (index !== -1) {
          state.posts[index] = post;
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
        state.events = action.payload.events; // Direct array
        state.eventPagination = action.payload.pagination;
      })
      .addCase(getPendingEvents.rejected, (state, action) => {
        state.eventLoading = false;
        state.eventError = action.payload;
      })
      // Approve Event
      .addCase(approveEvent.pending, (state) => {
        state.eventLoading = true;
      })
      .addCase(approveEvent.fulfilled, (state, action) => {
        state.eventLoading = false;
        const { event } = action.payload;
        const index = state.events.findIndex(e => e._id === event._id);
        if (index !== -1) {
          state.events[index] = event;
        }
      })
      .addCase(approveEvent.rejected, (state, action) => {
        state.eventLoading = false;
        state.eventError = action.payload;
      })
      // Reject Event
      .addCase(rejectEvent.pending, (state) => {
        state.eventLoading = true;
      })
      .addCase(rejectEvent.fulfilled, (state, action) => {
        state.eventLoading = false;
        const { event } = action.payload;
        const index = state.events.findIndex(e => e._id === event._id);
        if (index !== -1) {
          state.events[index] = event;
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
        state.orderPagination = action.payload.pagination || null;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.orderLoading = false;
        state.orderError = action.payload;
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

export default adminSlice.reducer;