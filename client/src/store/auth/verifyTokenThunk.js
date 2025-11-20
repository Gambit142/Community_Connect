import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const verifyToken = createAsyncThunk(
  'login/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Returns the data directly for loginSlice to handle it in extraReducers
      return { user: response.data.user, token };
    } catch (err) {
      localStorage.removeItem('token');
      return rejectWithValue(err.response?.data?.message || 'Token invalid');
    }
  }
);