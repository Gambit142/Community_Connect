import { createSlice } from '@reduxjs/toolkit';

const forgotSlice = createSlice({
  name: 'auth/forgot',
  initialState: {
    status: null,
    loading: false,
    error: null,
  },
  reducers: {},
});

export default forgotSlice.reducer;
