import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getRegisteredEvents = createAsyncThunk(
  'events/getRegisteredEvents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/events/registered`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch registered events');
    }
  }
);