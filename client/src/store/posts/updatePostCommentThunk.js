import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const updatePostComment = createAsyncThunk(
  'posts/updatePostComment',
  async ({ id, commentId, content }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const response = await axios.put(
        `${apiUrl}/posts/${id}/comments/${commentId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update comment');
    }
  }
);