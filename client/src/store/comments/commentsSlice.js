import { createSlice } from '@reduxjs/toolkit';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  toggleCommentLike,
  flagComment
} from './commentThunks.js';

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    comments: [],
    loading: false,
    error: null,
    successMessage: null,
    pagination: null,
    currentResource: null // Track which resource we're viewing comments for
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearComments: (state) => {
      state.comments = [];
      state.pagination = null;
      state.currentResource = null;
    },
    setCurrentResource: (state, action) => {
      state.currentResource = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Comment
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        // Add new comment to the beginning of the list
        state.comments.unshift(action.payload.comment);
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Comments
      .addCase(getComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload.comments;
        state.pagination = action.payload.pagination;
      })
      .addCase(getComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.comments = [];
      })

      // Update Comment
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        // Update comment in the list using recursive search
        const updateInTree = (comments) => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i]._id === action.payload.comment._id) {
              comments[i] = action.payload.comment;
              return true;
            }
            if (comments[i].children && updateInTree(comments[i].children)) {
              return true;
            }
          }
          return false;
        };
        updateInTree(state.comments);
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Comment
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        // Remove comment from the list using recursive search
        const removeFromTree = (comments) => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i]._id === action.meta.arg.commentId) {
              comments.splice(i, 1);
              return true;
            }
            if (comments[i].children && removeFromTree(comments[i].children)) {
              return true;
            }
          }
          return false;
        };
        removeFromTree(state.comments);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle Comment Like
      .addCase(toggleCommentLike.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleCommentLike.fulfilled, (state, action) => {
        state.loading = false;
        const { liked, likeCount } = action.payload;
        const commentId = action.meta.arg.commentId;
        
        // Update like status in the comment tree
        const updateLikeInTree = (comments) => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i]._id === commentId) {
              comments[i].likeCount = likeCount;
              comments[i].isLiked = liked;
              return true;
            }
            if (comments[i].children && updateLikeInTree(comments[i].children)) {
              return true;
            }
          }
          return false;
        };
        
        updateLikeInTree(state.comments);
      })
      .addCase(toggleCommentLike.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Flag Comment
      .addCase(flagComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(flagComment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(flagComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearComments, setCurrentResource } = commentsSlice.actions;
export default commentsSlice.reducer;