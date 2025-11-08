import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getFlaggedComments = createAsyncThunk(
  'admin/getFlaggedComments',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No auth token found');
      }
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      
      const response = await axios.get(
        `${apiUrl}/admin/comments/flagged?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch flagged comments');
    }
  }
);