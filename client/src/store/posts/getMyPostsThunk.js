import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getMyPosts = createAsyncThunk(
  'posts/getMyPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/posts/my-posts`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        params,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch posts');
    }
  }
);