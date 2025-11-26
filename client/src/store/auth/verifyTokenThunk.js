import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const verifyToken = createAsyncThunk(
  'login/verifyToken',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');

    if (!token) {
      return rejectWithValue('NO_TOKEN'); // ← special silent code
    }

    try {
      const apiUrl = process.env.NODE_ENV === 'test'
        ? import.meta.env.VITE_API_URL_TEST
        : import.meta.env.VITE_API_URL;

      const response = await axios.get(`${apiUrl}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        user: response.data.user,
        token,
      };
    } catch (err) {
      localStorage.removeItem('token');
      return rejectWithValue('Session expired');
    }
  }
);