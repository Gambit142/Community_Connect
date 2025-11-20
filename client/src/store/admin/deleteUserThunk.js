import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${apiUrl}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete user');
    }
  }
);