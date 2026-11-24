import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';
import { CameraPublishRequest, CameraResponse } from '../api/Api';
import { CameraModel, CameraStatus } from '../modules/types';
import { CAMERAS_MOCK, getCameraById, getNextCameraId, getPublishedCameras } from '../modules/mock';
import { logout } from './userSlice';

export const DEFAULT_MAX_POWER = 15.0;

const isMockOnlyMode = (): boolean =>
  import.meta.env.VITE_MOCK_ONLY === 'true' ||
  (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io'));

export interface CamerasState {
  cameras: CameraModel[];
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
  feedCamera: null,
  draftCamera: null,
  sliderPower: DEFAULT_MAX_POWER,
  appliedPower: DEFAULT_MAX_POWER,
  loading: false,
  actionLoading: false,
  isMockFallback: false,
  error: null,
};

function mapApiCamera(c: CameraResponse): CameraModel {
  return {
    id: c.id,
    model_name: c.model_name,
    description: c.description ?? '',
    power: c.power ?? 0,
    resolution: c.resolution ?? 'Full HD',
    is_outdoor: false,
    status: (c.status as CameraStatus) || 'published',
    image_url: c.image_url ?? '',
    video_url: c.video_url ?? '',
    likes_count: c.likes_count ?? 0,
    creator_id: c.creator_id,
    is_creator: c.is_creator ?? 0,
    is_liked: c.is_liked ?? 0,
  };
}

export const fetchCameras = createAsyncThunk<
  CameraModel[],
  number | undefined,
  { rejectValue: { isGuest: boolean; powerMax: number; message: string } }
>(
  'cameras/fetchCameras',
  async (explicitPower, { getState, rejectWithValue }) => {
    const state = getState() as { cameras: CamerasState; user: { isAuthenticated: boolean } };
    const powerMax = explicitPower !== undefined ? explicitPower : state.cameras.appliedPower;
    if (isMockOnlyMode()) {
      return rejectWithValue({
        isGuest: true,
        powerMax,
        message: 'Mock-режим для GitHub Pages',
      });
    }
    try {
      const query = powerMax < DEFAULT_MAX_POWER ? { power_max: powerMax } : undefined;
      const response = await api.api.getCamerasApiApiCamerasGet(query);
      return response.data.map(mapApiCamera);
    } catch {
      return rejectWithValue({
        isGuest: !state.user.isAuthenticated,
        powerMax,
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
    applyPowerFilter(state, action: PayloadAction<number | undefined>) {
      const val = action.payload !== undefined ? action.payload : state.sliderPower;
      state.sliderPower = val;
      state.appliedPower = val;
    },
    resetPowerFilter(state) {
      state.sliderPower = DEFAULT_MAX_POWER;
      state.appliedPower = DEFAULT_MAX_POWER;
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
        state.cameras = action.payload;
      })
      .addCase(fetchCameras.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload?.isGuest) {
          state.isMockFallback = true;
          state.cameras = getPublishedCameras(payload.powerMax);
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
        state.draftCamera = null;
        state.error = null;
      });
  },
});

export const { setSliderPower, applyPowerFilter, resetPowerFilter, clearCameraError } =
  camerasSlice.actions;
export default camerasSlice.reducer;
