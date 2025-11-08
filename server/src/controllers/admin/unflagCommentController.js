import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const unflagComment = createAsyncThunk(
  'admin/unflagComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No auth token found');
      }
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      
      const response = await axios.post(
        `${apiUrl}/admin/comments/${commentId}/unflag`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to unflag comment');
    }
  }
);