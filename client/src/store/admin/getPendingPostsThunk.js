import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getPendingPosts = createAsyncThunk(
  'admin/getPendingPosts',
  async (filters = {}, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No auth token found');
      }
      const stateFilters = getState().admin?.filters || {}; // Use state filters if no arg
      const params = { ...stateFilters, ...filters };
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/admin/posts/pending`, { 
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch pending posts');
    }
  }
);