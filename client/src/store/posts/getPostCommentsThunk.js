import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getPostComments = createAsyncThunk(
  'posts/getPostComments',
  async ({ id, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/posts/${id}/comments?page=${page}&limit=${limit}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch comments');
    }
  }
);