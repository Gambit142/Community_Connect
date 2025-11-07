import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const deleteEventComment = createAsyncThunk(
  'events/deleteEventComment',
  async ({ id, commentId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const response = await axios.delete(`${apiUrl}/events/${id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete comment');
    }
  }
);