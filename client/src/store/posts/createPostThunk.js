import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const formData = new FormData();
      Object.keys(postData).forEach(key => {
        let value = postData[key];
        if (key === 'images' && value.length > 0) {
          value.forEach(file => formData.append('images', file));
        } else if (key === 'tags') {
          // Ensure array or parse string to array
          if (typeof value === 'string') value = value.split(',').map(t => t.trim()).filter(Boolean);
          formData.append(key, value.join(','));
        } else if (key === 'details') {
          // Ensure object or parse string to object
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
      const response = await axios.post(`${apiUrl}/posts`, formData, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create post');
    }
  }
);