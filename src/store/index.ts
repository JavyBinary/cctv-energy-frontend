import { configureStore } from '@reduxjs/toolkit';
import camerasReducer from '../slices/camerasSlice';
import feedBatchReducer from '../slices/feedBatchSlice';
import userReducer from '../slices/userSlice';

export const store = configureStore({
  reducer: {
    cameras: camerasReducer,
    feedBatch: feedBatchReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
