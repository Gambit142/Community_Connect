import { createSlice } from '@reduxjs/toolkit';
import { createPost } from './createPostThunk.js';
import { getMyPosts } from './getMyPostsThunk.js';
import { getPosts } from './getPostsThunk.js';
import { getPostById } from './getPostByIdThunk.js';  
import { getSimilarPosts } from './getSimilarPostsThunk.js';  

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    currentPost: null,  
    similarPosts: [],   
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
    // Clear current post (e.g., on unmount)
    clearCurrentPost: (state) => {
      state.currentPost = null;
      state.similarPosts = [];
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
        state.posts.unshift(action.payload.post); 
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
      })
      // Get Posts (Public)
      .addCase(getPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Post by ID
      .addCase(getPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload.post;
      })
      .addCase(getPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentPost = null;
      })
      // Get Similar Posts
      .addCase(getSimilarPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSimilarPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.similarPosts = action.payload.similarPosts;
      })
      .addCase(getSimilarPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.similarPosts = [];
      });
  },
});

export const { clearError, clearCurrentPost } = postsSlice.actions;  
export default postsSlice.reducer;

// Re-export thunks for easy import in components
export { createPost } from './createPostThunk.js';
export { getMyPosts } from './getMyPostsThunk.js';
export { getPosts } from './getPostsThunk.js';
export { getPostById } from './getPostByIdThunk.js'; 
export { getSimilarPosts } from './getSimilarPostsThunk.js';