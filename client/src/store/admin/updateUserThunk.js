import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${apiUrl}/admin/users/${userId}`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update user');
    }
  }
);