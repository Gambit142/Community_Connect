import { createSlice } from '@reduxjs/toolkit';
import { createPost } from './createPostThunk.js';
import { getMyPosts } from './getMyPostsThunk.js';

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    pagination: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.posts.unshift(action.payload.post); // Optimistic add to list
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get My Posts
      .addCase(getMyPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = postsSlice.actions;
export default postsSlice.reducer;

// Re-export thunks for easy import in components
export { createPost } from './createPostThunk.js';
export { getMyPosts } from './getMyPostsThunk.js';