import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const getUserById = createAsyncThunk(
  'admin/getUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = response.data.users.find(u => u._id === userId);
      if (!user) {
        return rejectWithValue('User not found');
      }

      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
    }
  }
);