import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';
import { CameraPublishRequest } from '../api/Api';
import { CameraModel } from '../modules/types';
import { mapApiCamera } from '../modules/mapCamera';
import { CAMERAS_MOCK, getCameraById, getNextCameraId, getPublishedCameras } from '../modules/mock';
import { logout } from './userSlice';

export const DEFAULT_MAX_POWER = 15.0;
export const PAGE_LIMIT = 12;

export const isMockOnlyMode = (): boolean =>
  import.meta.env.VITE_MOCK_ONLY === 'true' ||
  (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io'));

export interface CamerasState {
  cameras: CameraModel[];
  total: number;
  currentPage: number;
  limit: number;
  queryMs: number | null;
  feedCamera: CameraModel | null;
  draftCamera: CameraModel | null;
  sliderPower: number;
  appliedPower: number;
  loading: boolean;
  actionLoading: boolean;
  isMockFallback: boolean;
  error: string | null;
}

const initialState: CamerasState = {
  cameras: [],
  total: 0,
  currentPage: 1,
  limit: PAGE_LIMIT,
  queryMs: null,
  feedCamera: null,
  draftCamera: null,
  sliderPower: DEFAULT_MAX_POWER,
  appliedPower: DEFAULT_MAX_POWER,
  loading: false,
  actionLoading: false,
  isMockFallback: false,
  error: null,
};

export const fetchCameras = createAsyncThunk<
  { total: number; page: number; limit: number; query_ms: number; data: CameraModel[] },
  { powerMax?: number; page?: number } | void,
  { rejectValue: { isGuest: boolean; powerMax: number; page: number; message: string } }
>(
  'cameras/fetchCameras',
  async (arg, { getState, rejectWithValue }) => {
    const state = getState() as { cameras: CamerasState; user: { isAuthenticated: boolean } };
    const powerMax =
      arg && arg.powerMax !== undefined ? arg.powerMax : state.cameras.appliedPower;
    const page = arg && arg.page !== undefined ? arg.page : state.cameras.currentPage;

    if (isMockOnlyMode()) {
      return rejectWithValue({
        isGuest: true,
        powerMax,
        page,
        message: 'Mock-режим для GitHub Pages',
      });
    }

    try {
      const response = await api.api.getCamerasApiApiCamerasGet({
        power_max: powerMax < DEFAULT_MAX_POWER ? powerMax : undefined,
        page,
        limit: state.cameras.limit,
      });
      return {
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        query_ms: response.data.query_ms ?? 0,
        data: response.data.data.map(mapApiCamera),
      };
    } catch {
      return rejectWithValue({
        isGuest: !state.user.isAuthenticated,
        powerMax,
        page,
        message: 'Сервер недоступен',
      });
    }
  }
);

export const fetchFeedCamera = createAsyncThunk<
  CameraModel,
  { cameraId?: number; next?: boolean },
  { rejectValue: { isGuest: boolean; cameraId?: number; next?: boolean; message: string } }
>(
  'cameras/fetchFeedCamera',
  async ({ cameraId, next = false }, { getState, rejectWithValue }) => {
    const state = getState() as { user: { isAuthenticated: boolean } };
    if (isMockOnlyMode()) {
      return rejectWithValue({
        isGuest: true,
        cameraId,
        next,
        message: 'Mock-режим для GitHub Pages',
      });
    }
    try {
      const response = await api.api.getCameraFeedApiApiCamerasFeedGet({
        camera_id: cameraId,
        next,
      });
      return mapApiCamera(response.data);
    } catch {
      return rejectWithValue({
        isGuest: !state.user.isAuthenticated,
        cameraId,
        next,
        message: 'Не удалось загрузить камеру для ленты',
      });
    }
  }
);

export const fetchDraftCamera = createAsyncThunk<CameraModel | null, void, { rejectValue: string }>(
  'cameras/fetchDraftCamera',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.api.getCameraDraftApiApiCamerasDraftGet();
      return mapApiCamera(response.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return null;
      }
      return rejectWithValue('Ошибка при получении черновика');
    }
  }
);

export const createDraftCamera = createAsyncThunk<
  CameraModel,
  { model_name: string; image_file?: File | null; video_file?: File | null },
  { rejectValue: string }
>(
  'cameras/createDraftCamera',
  async ({ model_name, image_file, video_file }, { rejectWithValue }) => {
    try {
      const response = await api.api.createCameraApiApiCamerasPost({
        model_name,
        image_file: image_file ?? undefined,
        video_file: video_file ?? undefined,
      });
      return mapApiCamera(response.data);
    } catch {
      return rejectWithValue('Не удалось создать черновик модели камеры');
    }
  }
);

export const publishCamera = createAsyncThunk<
  CameraModel,
  { cameraId: number; data: CameraPublishRequest },
  { rejectValue: string }
>(
  'cameras/publishCamera',
  async ({ cameraId, data }, { rejectWithValue }) => {
    try {
      const response = await api.api.publishCameraApiApiCamerasCameraIdPublishPut(cameraId, data);
      return mapApiCamera(response.data);
    } catch {
      return rejectWithValue('Не удалось опубликовать модель камеры');
    }
  }
);

export const deleteCamera = createAsyncThunk<number, number, { rejectValue: string }>(
  'cameras/deleteCamera',
  async (cameraId, { rejectWithValue }) => {
    try {
      await api.api.deleteCameraApiApiCamerasCameraIdDelete(cameraId);
      return cameraId;
    } catch {
      return rejectWithValue('Не удалось удалить модель камеры');
    }
  }
);

export const toggleLikeCamera = createAsyncThunk<
  CameraModel,
  { cameraId: number; like: number },
  { rejectValue: string }
>(
  'cameras/toggleLikeCamera',
  async ({ cameraId, like }, { rejectWithValue }) => {
    try {
      const response = await api.api.toggleCameraLikeApiApiCamerasCameraIdLikePost(cameraId, {
        like,
      });
      return mapApiCamera(response.data);
    } catch {
      return rejectWithValue('Не удалось обновить лайк');
    }
  }
);

const camerasSlice = createSlice({
  name: 'cameras',
  initialState,
  reducers: {
    setSliderPower(state, action: PayloadAction<number>) {
      state.sliderPower = action.payload;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = Math.max(1, action.payload);
    },
    applyPowerFilter(state, action: PayloadAction<number | undefined>) {
      const val = action.payload !== undefined ? action.payload : state.sliderPower;
      state.sliderPower = val;
      state.appliedPower = val;
      state.currentPage = 1;
    },
    resetPowerFilter(state) {
      state.sliderPower = DEFAULT_MAX_POWER;
      state.appliedPower = DEFAULT_MAX_POWER;
      state.currentPage = 1;
    },
    clearCameraError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCameras.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCameras.fulfilled, (state, action) => {
        state.loading = false;
        state.isMockFallback = false;
        state.cameras = action.payload.data;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.limit = action.payload.limit;
        state.queryMs = action.payload.query_ms;
      })
      .addCase(fetchCameras.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload?.isGuest) {
          state.isMockFallback = true;
          const filtered = getPublishedCameras(payload.powerMax);
          const start = (payload.page - 1) * state.limit;
          state.total = filtered.length;
          state.currentPage = payload.page;
          state.queryMs = null;
          state.cameras = filtered.slice(start, start + state.limit);
          state.error = null;
        } else {
          state.error = payload?.message || 'Ошибка загрузки каталога';
        }
      })
      .addCase(fetchFeedCamera.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedCamera.fulfilled, (state, action) => {
        state.loading = false;
        state.isMockFallback = false;
        state.feedCamera = action.payload;
      })
      .addCase(fetchFeedCamera.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload?.isGuest) {
          state.isMockFallback = true;
          const published = getPublishedCameras();
          if (payload.cameraId && payload.next) {
            const nextId = getNextCameraId(payload.cameraId);
            state.feedCamera = getCameraById(nextId) ?? published[0] ?? CAMERAS_MOCK[0] ?? null;
          } else if (payload.cameraId) {
            state.feedCamera = getCameraById(payload.cameraId) ?? published[0] ?? null;
          } else {
            state.feedCamera = published[0] ?? CAMERAS_MOCK[0] ?? null;
          }
          state.error = null;
        } else {
          state.feedCamera = null;
          state.error = payload?.message || 'Камера не найдена';
        }
      })
      .addCase(fetchDraftCamera.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDraftCamera.fulfilled, (state, action) => {
        state.loading = false;
        state.draftCamera = action.payload;
      })
      .addCase(fetchDraftCamera.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка получения черновика';
      })
      .addCase(createDraftCamera.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createDraftCamera.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.draftCamera = action.payload;
      })
      .addCase(createDraftCamera.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Ошибка создания черновика';
      })
      .addCase(publishCamera.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(publishCamera.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.draftCamera = null;
        state.feedCamera = action.payload;
      })
      .addCase(publishCamera.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Ошибка публикации';
      })
      .addCase(deleteCamera.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteCamera.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.cameras = state.cameras.filter((c) => c.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteCamera.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Ошибка удаления';
      })
      .addCase(toggleLikeCamera.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(toggleLikeCamera.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.feedCamera = action.payload;
        state.cameras = state.cameras.map((c) => (c.id === action.payload.id ? action.payload : c));
      })
      .addCase(toggleLikeCamera.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Ошибка лайка';
      })
      .addCase(logout, (state) => {
        state.sliderPower = DEFAULT_MAX_POWER;
        state.appliedPower = DEFAULT_MAX_POWER;
        state.currentPage = 1;
        state.draftCamera = null;
        state.error = null;
      });
  },
});

export const {
  setSliderPower,
  setCurrentPage,
  applyPowerFilter,
  resetPowerFilter,
  clearCameraError,
} = camerasSlice.actions;
export default camerasSlice.reducer;
