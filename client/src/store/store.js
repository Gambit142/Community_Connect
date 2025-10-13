import { configureStore } from '@reduxjs/toolkit';
import registerReducer from './auth/registerSlice.js';
import loginReducer from './auth/loginSlice.js';
import forgotReducer from './auth/forgotSlice.js';

const store = configureStore({
  reducer: {
    register: registerReducer,
    login: loginReducer,
    forgot: forgotReducer,
  },
});

export default store;