import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api';
import { getFeedSession, setFeedSession } from '../modules/feedSession';
import { mapApiCamera } from '../modules/mapCamera';
import { CameraModel } from '../modules/types';
import { deleteCamera, isMockOnlyMode, toggleLikeCamera } from './camerasSlice';

export type FeedBatchStatus = 'idle' | 'loading' | 'ready' | 'failed';

export interface FeedBatchItemModel {
  camera: CameraModel;
  position: number;
}

export interface FeedBatchState {
  status: FeedBatchStatus;
  sessionId: string;
  batchNumber: number;
  firstPosition: number;
  items: FeedBatchItemModel[];
  forAuthenticated: boolean;
  error: string | null;
}

const initialState: FeedBatchState = {
  status: 'idle',
  sessionId: '',
  batchNumber: 0,
  firstPosition: 1,
  items: [],
  forAuthenticated: false,
  error: null,
};

export const fetchFeedBatch = createAsyncThunk<
  { sessionId: string; batchNumber: number; firstPosition: number; items: FeedBatchItemModel[] },
  { refresh: boolean; authenticated: boolean },
  { state: { feedBatch: FeedBatchState }; rejectValue: string }
>(
  'feedBatch/fetchFeedBatch',
  async ({ refresh }, { getState, rejectWithValue }) => {
    if (isMockOnlyMode()) {
      return rejectWithValue('Mock-режим: используется локальная лента');
    }
    const sessionId = getState().feedBatch.sessionId || getFeedSession();
    try {
      const response = await api.api.getCameraFeedBatchApiApiCamerasFeedBatchGet({
        session_id: sessionId || undefined,
        refresh: refresh || undefined,
      });
      return {
        sessionId: response.data.session_id,
        batchNumber: response.data.batch_number,
        firstPosition: response.data.first_position,
        items: response.data.items.map((item) => ({
          camera: mapApiCamera(item.camera),
          position: item.position,
        })),
      };
    } catch {
      return rejectWithValue('Не удалось загрузить порцию ленты из Redis');
    }
  }
);

const feedBatchSlice = createSlice({
  name: 'feedBatch',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedBatch.pending, (state, action) => {
        state.status = 'loading';
        state.forAuthenticated = action.meta.arg.authenticated;
        state.error = null;
      })
      .addCase(fetchFeedBatch.fulfilled, (state, action) => {
        state.status = 'ready';
        state.sessionId = action.payload.sessionId;
        state.batchNumber = action.payload.batchNumber;
        state.firstPosition = action.payload.firstPosition;
        state.items = action.payload.items;
        setFeedSession(action.payload.sessionId);
      })
      .addCase(fetchFeedBatch.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Лента Redis недоступна';
        state.items = [];
      })
      .addCase(toggleLikeCamera.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item.camera.id === action.payload.id
            ? { ...item, camera: action.payload }
            : item
        );
      })
      .addCase(deleteCamera.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.camera.id !== action.payload);
      });
  },
});

export default feedBatchSlice.reducer;
