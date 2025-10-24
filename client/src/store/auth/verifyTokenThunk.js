import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { loginUser } from './loginSlice.js'; // Reuse fulfilled logic

export const verifyToken = createAsyncThunk(
  'login/verifyToken',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Manually set user/token in state (reuse login fulfilled)
      dispatch({ type: loginUser.fulfilled.type, payload: { user: response.data.user, token } });
      return response.data;
    } catch (err) {
      localStorage.removeItem('token');
      return rejectWithValue(err.response?.data?.message || 'Token invalid');
    }
  }
);