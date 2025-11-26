import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { verifyToken } from './verifyTokenThunk.js';
import { clearProfile } from '../profile/profileSlice.js';  // ← ADD THIS IMPORT

export const loginUser = createAsyncThunk(
  'login/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NODE_ENV === 'test' 
        ? import.meta.env.VITE_API_URL_TEST 
        : import.meta.env.VITE_API_URL;

      const response = await axios.post(`${apiUrl}/auth/login`, userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

const loginSlice = createSlice({
  name: 'login',
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
    successMessage: null,
    isInitialized: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.successMessage = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login flow
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.successMessage = 'Login successful';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify token on app start / refresh
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token || localStorage.getItem('token');
        state.isInitialized = true;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isInitialized = true;

        if (action.payload !== 'NO_TOKEN') {
          state.error = action.payload;
        }

        localStorage.removeItem('token');
      })

      .addCase(logout, (state) => {
      });
  },
});

export const logoutUser = () => (dispatch) => {
  dispatch(logout());
  dispatch(clearProfile()); 
};

export const { clearError, logout } = loginSlice.actions;
export default loginSlice.reducer;