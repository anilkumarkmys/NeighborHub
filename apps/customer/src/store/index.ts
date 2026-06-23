import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import feedReducer from './slices/feedSlice';
import eventsReducer from './slices/eventsSlice';
import marketplaceReducer from './slices/marketplaceSlice';
import messagesReducer from './slices/messagesSlice';
import notificationsReducer from './slices/notificationsSlice';
import neighborsReducer from './slices/neighborsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feed: feedReducer,
    events: eventsReducer,
    marketplace: marketplaceReducer,
    messages: messagesReducer,
    notifications: notificationsReducer,
    neighbors: neighborsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
