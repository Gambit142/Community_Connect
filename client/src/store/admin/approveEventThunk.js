import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const approveEvent = createAsyncThunk(
  'admin/approveEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No auth token found');
      }
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const response = await axios.put(`${apiUrl}/admin/events/${eventId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to approve event');
    }
  }
);