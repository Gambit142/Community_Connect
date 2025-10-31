import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ eventId, eventData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No auth token found');
      }
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
      const response = await axios.put(`${apiUrl}/events/${eventId}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update event');
    }
  }
);