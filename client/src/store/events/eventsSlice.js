import { createSlice } from '@reduxjs/toolkit';
import { createEvent } from './createEventThunk.js';
import { getMyEvents } from './getMyEventsThunk.js';
import { getEvents } from './getEventsThunk.js';
import { getEventById } from './getEventByIdThunk.js';
import { getSimilarEvents } from './getSimilarEventsThunk.js';
import { updateEvent } from './updateEventThunk.js';
import { deleteEvent } from './deleteEventThunk.js';

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    currentEvent: null,
    similarEvents: [],
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
    // Clear current event (e.g., on unmount)
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
      state.similarEvents = [];
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
      });
  },
});

export const { clearError, clearCurrentEvent } = eventsSlice.actions;  
export default eventsSlice.reducer;

// Re-export thunks for easy import in components
export { createEvent } from './createEventThunk.js';
export { getMyEvents } from './getMyEventsThunk.js';
export { getEvents } from './getEventsThunk.js';
export { getEventById } from './getEventByIdThunk.js';
export { getSimilarEvents } from './getSimilarEventsThunk.js';
export { updateEvent } from './updateEventThunk.js';
export { deleteEvent } from './deleteEventThunk.js';