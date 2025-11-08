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
    loading: false,
    loadingRegistered: false, // Separate loading for registered
    error: null,
    errorRegistered: null, // Separate error for registered
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.successMessage = null;
      state.errorRegistered = null; // Clear registered error too
    },
    // Clear current event (e.g., on unmount)
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
      state.similarEvents = [];
    },
    // Clear registered events (optional, for unmount)
    clearRegisteredEvents: (state) => {
      state.registeredEvents = [];
      state.paginationRegistered = null;
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
      });

  },
});

export const { clearError, clearCurrentEvent, clearRegisteredEvents } = eventsSlice.actions;  
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
export { likeEvent } from './likeEventThunk.js';