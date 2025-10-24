import { createSlice } from '@reduxjs/toolkit';
import { getPendingPosts } from './getPendingPostsThunk.js';
import { approvePost } from './approvePostThunk.js';
import { rejectPost } from './rejectPostThunk.js';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    posts: [], // Now array for current page
    pagination: null,
    loading: false,
    error: null,
    filters: { search: '', page: 1, limit: 10 },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination = null; // Reset pagination
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Pending Posts
      .addCase(getPendingPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts; // Direct array
        state.pagination = action.payload.pagination;
      })
      .addCase(getPendingPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve Post
      .addCase(approvePost.pending, (state) => {
        state.loading = true;
      })
      .addCase(approvePost.fulfilled, (state, action) => {
        state.loading = false;
        const { post } = action.payload;
        const index = state.posts.findIndex(p => p._id === post._id);
        if (index !== -1) {
          state.posts[index] = { ...state.posts[index], status: 'Published' };
        }
      })
      .addCase(approvePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject Post
      .addCase(rejectPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(rejectPost.fulfilled, (state, action) => {
        state.loading = false;
        const { post } = action.payload;
        const index = state.posts.findIndex(p => p._id === post._id);
        if (index !== -1) {
          state.posts[index] = { ...state.posts[index], status: 'Rejected' };
        }
      })
      .addCase(rejectPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearError } = adminSlice.actions;
// Re-export thunks for easy import in components
export { getPendingPosts } from './getPendingPostsThunk.js';
export { approvePost } from './approvePostThunk.js';
export { rejectPost } from './rejectPostThunk.js';
export default adminSlice.reducer;