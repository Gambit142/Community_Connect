import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const formData = new FormData();
      
      Object.keys(eventData).forEach(key => {
        let value = eventData[key];
        if (key === 'images' && value.length > 0) {
          value.forEach(file => formData.append('images', file));
        } else {
          formData.append(key, value);
        }
      });

      const response = await axios.post(`${apiUrl}/events`, formData, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (err) {
      // Enhanced error handling to match createPost pattern
      const error = err.response?.data;
      
      // Handle different error response formats
      if (error?.message) {
        return rejectWithValue(error.message);
      } else if (error?.errors) {
        // Handle validation errors array
        const errorMessages = error.errors.map(err => err.msg || err.message).join(', ');
        return rejectWithValue(errorMessages);
      } else if (typeof error === 'string') {
        return rejectWithValue(error);
      } else if (err.message) {
        return rejectWithValue(err.message);
      } else {
        return rejectWithValue('Failed to create event');
      }
    }
  }
);