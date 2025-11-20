import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const getAllUsers = createAsyncThunk(
  'admin/getAllUsers',
  async (_, { rejectWithValue }) => { 
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Your backend returns { users: [...] } directly
      const users = response.data.users || response.data;

      console.log('Fetched users:', users);

      return {
        users: Array.isArray(users) ? users : [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalUsers: Array.isArray(users) ? users.length : 0,
        },
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
    }
  }
);