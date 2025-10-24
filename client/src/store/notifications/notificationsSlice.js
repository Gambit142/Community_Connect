import { createSlice } from '@reduxjs/toolkit';
import { getNotifications } from './getNotificationsThunk.js';
import { markAsRead as markAsReadThunk } from './markAsReadThunk.js';
import { markAllAsRead as markAllAsReadThunk } from './markAllAsReadThunk.js';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark single as read
      .addCase(markAsReadThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAsReadThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedNotification = action.payload.notification;
        const index = state.notifications.findIndex(n => n._id === updatedNotification._id);
        if (index !== -1) {
          const wasUnread = !state.notifications[index].isRead;
          state.notifications[index] = updatedNotification;
          if (wasUnread) {
            state.unreadCount -= 1;
          }
        }
      })
      .addCase(markAsReadThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark all as read
      .addCase(markAllAsReadThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllAsReadThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(markAllAsReadThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;

// Re-export thunks for easy import
export { getNotifications } from './getNotificationsThunk.js';
export { markAsRead as markAsReadThunk } from './markAsReadThunk.js';
export { markAllAsRead as markAllAsReadThunk } from './markAllAsReadThunk.js';
