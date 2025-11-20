import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${apiUrl}/admin/users`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create user');
    }
  }
);