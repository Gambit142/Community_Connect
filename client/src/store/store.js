import { configureStore } from '@reduxjs/toolkit';
import registerReducer from './auth/registerSlice.js';
import loginReducer from './auth/loginSlice.js';
import forgotReducer from './auth/forgotSlice.js';
import postsReducer from './posts/postsSlice.js';
import adminReducer from './admin/adminSlice.js';
import notificationsReducer from './notifications/notificationsSlice.js';

const store = configureStore({
  reducer: {
    register: registerReducer,
    login: loginReducer,
    forgot: forgotReducer,
    posts: postsReducer,
    admin: adminReducer,
    notifications: notificationsReducer, 
  },
});

export default store;