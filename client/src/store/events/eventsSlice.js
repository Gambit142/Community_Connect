import { createSlice } from '@reduxjs/toolkit';
import { createEvent } from './createEventThunk.js';
import { getMyEvents } from './getMyEventsThunk.js';
import { getEvents } from './getEventsThunk.js';
import { getEventById } from './getEventByIdThunk.js';
import { getSimilarEvents } from './getSimilarEventsThunk.js';
import { updateEvent } from './updateEventThunk.js';
import { deleteEvent } from './deleteEventThunk.js';
import { registerEvent } from './registerEventThunk.js';
import { getRegisteredEvents } from './getRegisteredEventsThunk.js';
import { getEventComments } from './getEventCommentsThunk.js';
import { createEventComment } from './createEventCommentThunk.js';
import { updateEventComment } from './updateEventCommentThunk.js';
import { deleteEventComment } from './deleteEventCommentThunk.js';
import { toggleEventCommentLike } from './toggleEventCommentLikeThunk.js';
import { flagEventComment } from './flagEventCommentThunk.js';
import { likeEvent } from './likeEventThunk.js';

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    currentEvent: null,
    similarEvents: [],
    registeredEvents: [], // For registered events list
    pagination: null,
    paginationRegistered: null, // For registered pagination
    comments: [], // For current event comments tree
    commentsPagination: null,
    loading: false,
    loadingRegistered: false, // Separate loading for registered
    commentsLoading: false, // Separate for comments
    error: null,
    errorRegistered: null, // Separate error for registered
    commentsError: null, // Separate for comments
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.successMessage = null;
      state.errorRegistered = null; // Clear registered error too
      state.commentsError = null;
    },
    // Clear current event (e.g., on unmount)
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
      state.similarEvents = [];
      state.comments = [];
      state.commentsPagination = null;
    },
    // Clear registered events (optional, for unmount)
    clearRegisteredEvents: (state) => {
      state.registeredEvents = [];
      state.paginationRegistered = null;
    },
    // Clear comments (e.g., when switching events)
    clearComments: (state) => {
      state.comments = [];
      state.commentsPagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.events.unshift(action.payload.event); 
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Event
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        const index = state.events.findIndex(e => e._id === action.payload.event._id);
        if (index !== -1) {
          state.events[index] = action.payload.event;
        }
        if (state.currentEvent?._id === action.payload.event._id) {
          state.currentEvent = action.payload.event;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.events = state.events.filter(e => e._id !== action.meta.arg);
        if (state.currentEvent?._id === action.meta.arg) {
          state.currentEvent = null;
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get My Events
      .addCase(getMyEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.events;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Events (Public)
      .addCase(getEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.events;
        state.pagination = action.payload.pagination;
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Event by ID
      .addCase(getEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload.event;
      })
      .addCase(getEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentEvent = null;
      })
      // Get Similar Events
      .addCase(getSimilarEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSimilarEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.similarEvents = action.payload.similarEvents;
      })
      .addCase(getSimilarEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.similarEvents = [];
      })
      // Like Event
      .addCase(likeEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(likeEvent.fulfilled, (state, action) => {
        state.loading = false;
        const { liked, likeCount } = action.payload;
        const eventId = action.meta.arg;
        // Update in events list
        const eventIndex = state.events.findIndex(e => e._id === eventId);
        if (eventIndex !== -1) {
          state.events[eventIndex].likeCount = likeCount;
          state.events[eventIndex].isLiked = liked;
        }
        // Update current event
        if (state.currentEvent?._id === eventId) {
          state.currentEvent.likeCount = likeCount;
          state.currentEvent.isLiked = liked;
        }
      })
      .addCase(likeEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register Event (New)
      .addCase(registerEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerEvent.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.sessionId) {
          // Paid: Set message for redirect
          state.successMessage = 'Redirecting to payment...';
        } else {
          // Free: Success with event
          state.successMessage = action.payload.message;
          // Update events list if present (e.g., increment attendee count)
          const eventIndex = state.events.findIndex(e => e._id === action.meta.arg);
          if (eventIndex !== -1) {
            state.events[eventIndex].attendees = action.payload.event.attendees; // Update count
          }
          if (state.currentEvent?._id === action.meta.arg) {
            state.currentEvent.attendees = action.payload.event.attendees;
          }
        }
      })
      .addCase(registerEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Registered Events
      .addCase(getRegisteredEvents.pending, (state) => {
        state.loadingRegistered = true;
        state.errorRegistered = null;
      })
      .addCase(getRegisteredEvents.fulfilled, (state, action) => {
        state.loadingRegistered = false;
        state.registeredEvents = action.payload.events;
        state.paginationRegistered = action.payload.pagination;
      })
      .addCase(getRegisteredEvents.rejected, (state, action) => {
        state.loadingRegistered = false;
        state.errorRegistered = action.payload;
        state.registeredEvents = [];
      })
      // Get Event Comments
      .addCase(getEventComments.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(getEventComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments = action.payload.comments;
        state.commentsPagination = action.payload.pagination;
      })
      .addCase(getEventComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
        state.comments = [];
      })
      // Create Event Comment
      .addCase(createEventComment.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(createEventComment.fulfilled, (state, action) => {
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
        // Increment commentCount if current event
        if (state.currentEvent) {
          state.currentEvent.commentCount += 1;
        }
      })
      .addCase(createEventComment.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
      })
      // Update Event Comment
      .addCase(updateEventComment.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(updateEventComment.fulfilled, (state, action) => {
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
      .addCase(updateEventComment.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
      })
      // Delete Event Comment
      .addCase(deleteEventComment.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(deleteEventComment.fulfilled, (state, action) => {
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
        // Decrement commentCount if current event
        if (state.currentEvent) {
          state.currentEvent.commentCount -= 1;
        }
      })
      .addCase(deleteEventComment.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
      })
      // Toggle Event Comment Like
      .addCase(toggleEventCommentLike.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(toggleEventCommentLike.fulfilled, (state, action) => {
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
      .addCase(toggleEventCommentLike.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
      })
      // Flag Event Comment
      .addCase(flagEventComment.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(flagEventComment.fulfilled, (state, action) => {
        state.commentsLoading = false;
        // Optionally update flagged state if backend returns it
      })
      .addCase(flagEventComment.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
      });
  },
});

export const { clearError, clearCurrentEvent, clearRegisteredEvents, clearComments } = eventsSlice.actions;  
export default eventsSlice.reducer;

// Re-export thunks for easy import in components
export { createEvent } from './createEventThunk.js';
export { getMyEvents } from './getMyEventsThunk.js';
export { getEvents } from './getEventsThunk.js';
export { getEventById } from './getEventByIdThunk.js';
export { getSimilarEvents } from './getSimilarEventsThunk.js';
export { updateEvent } from './updateEventThunk.js';
export { deleteEvent } from './deleteEventThunk.js';
export { registerEvent } from './registerEventThunk.js';
export { getRegisteredEvents } from './getRegisteredEventsThunk.js';
export { getEventComments } from './getEventCommentsThunk.js';
export { createEventComment } from './createEventCommentThunk.js';
export { updateEventComment } from './updateEventCommentThunk.js';
export { deleteEventComment } from './deleteEventCommentThunk.js';
export { toggleEventCommentLike } from './toggleEventCommentLikeThunk.js';
export { flagEventComment } from './flagEventCommentThunk.js';
export { likeEvent } from './likeEventThunk.js';