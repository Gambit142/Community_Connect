import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const togglePostCommentLike = createAsyncThunk(
  'posts/togglePostCommentLike',
  async ({ id, commentId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const response = await axios.post(
        `${apiUrl}/posts/${id}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle like');
    }
  }
);