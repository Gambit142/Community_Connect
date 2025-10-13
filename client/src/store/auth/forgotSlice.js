import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const forgotPassword = createAsyncThunk(
  'forgot/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/auth/forgot`, { email });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'forgot/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NODE_ENV === 'test' ? import.meta.env.VITE_API_URL_TEST : import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/auth/reset`, { token, newPassword });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Reset failed');
    }
  }
);

const forgotSlice = createSlice({
  name: 'forgot',
  initialState: {
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || 'If your email exists, you will receive a reset link';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || 'Password reset successful';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessage } = forgotSlice.actions;
export default forgotSlice.reducer;