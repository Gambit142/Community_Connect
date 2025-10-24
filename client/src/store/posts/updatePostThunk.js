import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No auth token found');
      }
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const formData = new FormData();
      Object.keys(postData).forEach(key => {
        let value = postData[key];
        if (key === 'images' && value.length > 0) {
          value.forEach(file => formData.append('images', file));
        } else if (key === 'tags') {
          if (typeof value === 'string') value = value.split(',').map(t => t.trim()).filter(Boolean);
          formData.append(key, value.join(','));
        } else if (key === 'details') {
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value);
            } catch {
              value = {};
            }
          }
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      const response = await axios.put(`${apiUrl}/posts/${postId}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update post');
    }
  }
);