import { createSlice } from '@reduxjs/toolkit';
import { createEvent } from './createEventThunk.js';
import { getMyEvents } from './getMyEventsThunk.js';

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    currentEvent: null,
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
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
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
      });
  },
});

export const { clearError, clearCurrentEvent } = eventsSlice.actions;  
export default eventsSlice.reducer;

// Re-export thunks for easy import in components
export { createEvent } from './createEventThunk.js';
export { getMyEvents } from './getMyEventsThunk.js'; 