import { createSlice } from '@reduxjs/toolkit';
import { createPost } from './createPostThunk.js';
import { getMyPosts } from './getMyPostsThunk.js';
import { getPosts } from './getPostsThunk.js';
import { getPostById } from './getPostByIdThunk.js';  
import { getSimilarPosts } from './getSimilarPostsThunk.js';  
import { updatePost } from './updatePostThunk.js';
import { deletePost } from './deletePostThunk.js';
import { getPostComments } from './getPostCommentsThunk.js';
import { createPostComment } from './createPostCommentThunk.js';
import { updatePostComment } from './updatePostCommentThunk.js';
import { deletePostComment } from './deletePostCommentThunk.js';
import { togglePostCommentLike } from './togglePostCommentLikeThunk.js';
import { flagPostComment } from './flagPostCommentThunk.js';
import { likePost } from './likePostThunk.js';

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    currentPost: null,  
    similarPosts: [],   
    pagination: null,
    comments: [], // For current post comments tree
    commentsPagination: null,
    loading: false,
    commentsLoading: false, // Separate for comments
    error: null,
    commentsError: null, // Separate for comments
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.commentsError = null;
      state.successMessage = null;
    },
    // Clear current post (e.g., on unmount)
    clearCurrentPost: (state) => {
      state.currentPost = null;
      state.similarPosts = [];
      state.comments = [];
      state.commentsPagination = null;
    },
    // Clear comments (e.g., when switching posts)
    clearComments: (state) => {
      state.comments = [];
      state.commentsPagination = null;
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
      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        const index = state.posts.findIndex(p => p._id === action.payload.post._id);
        if (index !== -1) {
          state.posts[index] = action.payload.post;
        }
        if (state.currentPost?._id === action.payload.post._id) {
          state.currentPost = action.payload.post;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.posts = state.posts.filter(p => p._id !== action.meta.arg);
        if (state.currentPost?._id === action.meta.arg) {
          state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
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
      })
      // Like Post
      .addCase(likePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.loading = false;
        const { liked, likeCount } = action.payload;
        const postId = action.meta.arg;
        // Update in posts list
        const postIndex = state.posts.findIndex(p => p._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].likeCount = likeCount;
          if (liked) {
            state.posts[postIndex].isLiked = true;
          } else {
            state.posts[postIndex].isLiked = false;
          }
        }
        // Update current post
        if (state.currentPost?._id === postId) {
          state.currentPost.likeCount = likeCount;
          state.currentPost.isLiked = liked;
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Post Comments
      .addCase(getPostComments.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(getPostComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments = action.payload.comments;
        state.commentsPagination = action.payload.pagination;
      })
      .addCase(getPostComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
        state.comments = [];
      })
      // Create Post Comment
      .addCase(createPostComment.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(createPostComment.fulfilled, (state, action) => {
        state.commentsLoading = false;
        // Add to top-level comments (assuming tree structure; adjust if needed)
        if (action.payload.comment.parentComment) {
          // Reply: Find parent and add to children (simplified; use recursive update in real app)
          const parentIndex = state.comments.findIndex(c => c._id === action.payload.comment.parentComment);
          if (parentIndex !== -1 && state.comments[parentIndex].children) {
            state.comments[parentIndex].children.unshift(action.payload.comment);
          }
        } else {
          state.comments.unshift(action.payload.comment);
        }
        // Increment commentCount if current post
        if (state.currentPost) {
          state.currentPost.commentCount += 1;
        }
      })
      .addCase(createPostComment.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
      })
      // Update Post Comment
      .addCase(updatePostComment.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(updatePostComment.fulfilled, (state, action) => {
        state.commentsLoading = false;
        const updatedComment = action.payload.comment;
        // Update in tree (simplified; find and replace recursively)
        const updateInTree = (comments) => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i]._id === updatedComment._id) {
              comments[i] = updatedComment;
              return true;
            }
            if (comments[i].children && updateInTree(comments[i].children)) return true;
          }
          return false;
        };
        updateInTree(state.comments);
      })
      .addCase(updatePostComment.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
      })
      // Delete Post Comment
      .addCase(deletePostComment.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(deletePostComment.fulfilled, (state, action) => {
        state.commentsLoading = false;
        const commentId = action.meta.arg.commentId;
        // Remove from tree (simplified; find and remove recursively)
        const removeFromTree = (comments) => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i]._id === commentId) {
              comments.splice(i, 1);
              return true;
            }
            if (comments[i].children && removeFromTree(comments[i].children)) return true;
          }
          return false;
        };
        removeFromTree(state.comments);
        // Decrement commentCount if current post
        if (state.currentPost) {
          state.currentPost.commentCount -= 1;
        }
      })
      .addCase(deletePostComment.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
      })
      // Toggle Post Comment Like
      .addCase(togglePostCommentLike.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(togglePostCommentLike.fulfilled, (state, action) => {
        state.commentsLoading = false;
        const { liked, likeCount } = action.payload;
        const commentId = action.meta.arg.commentId;
        // Update in tree
        const updateLikeInTree = (comments) => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i]._id === commentId) {
              comments[i].likeCount = likeCount;
              comments[i].isLiked = liked;
              return true;
            }
            if (comments[i].children && updateLikeInTree(comments[i].children)) return true;
          }
          return false;
        };
        updateLikeInTree(state.comments);
      })
      .addCase(togglePostCommentLike.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
      })
      // Flag Post Comment
      .addCase(flagPostComment.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(flagPostComment.fulfilled, (state, action) => {
        state.commentsLoading = false;
        // Optionally update flagged state if backend returns it
      })
      .addCase(flagPostComment.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
      });
  },
});

export const { clearError, clearCurrentPost, clearComments } = postsSlice.actions;  
export default postsSlice.reducer;

// Re-export thunks for easy import in components
export { createPost } from './createPostThunk.js';
export { getMyPosts } from './getMyPostsThunk.js';
export { getPosts } from './getPostsThunk.js';
export { getPostById } from './getPostByIdThunk.js'; 
export { getSimilarPosts } from './getSimilarPostsThunk.js';
export { updatePost } from './updatePostThunk.js';
export { deletePost } from './deletePostThunk.js';
export { getPostComments } from './getPostCommentsThunk.js';
export { createPostComment } from './createPostCommentThunk.js';
export { updatePostComment } from './updatePostCommentThunk.js';
export { deletePostComment } from './deletePostCommentThunk.js';
export { togglePostCommentLike } from './togglePostCommentLikeThunk.js';
export { flagPostComment } from './flagPostCommentThunk.js';
export { likePost } from './likePostThunk.js';