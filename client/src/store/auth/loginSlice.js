import { createSlice } from '@reduxjs/toolkit';

const loginSlice = createSlice({
  name: 'auth/login',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {},
});

export default loginSlice.reducer;
