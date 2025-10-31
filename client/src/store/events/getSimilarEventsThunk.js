// New file: store/events/getSimilarEventsThunk.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getSimilarEvents = createAsyncThunk(
  'events/getSimilarEvents',
  async (id, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/events/${id}/similar`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch similar events');
    }
  }
);