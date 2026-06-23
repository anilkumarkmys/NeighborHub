import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import contentReducer from './slices/contentSlice';
import reportsReducer from './slices/reportsSlice';
import analyticsReducer from './slices/analyticsSlice';
import versionsReducer from './slices/versionsSlice';
import neighborhoodsReducer from './slices/neighborhoodsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    content: contentReducer,
    reports: reportsReducer,
    analytics: analyticsReducer,
    versions: versionsReducer,
    neighborhoods: neighborhoodsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
