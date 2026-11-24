import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  username: string;
  userId: number | null;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: UserState = {
  username: '',
  userId: null,
  isAuthenticated: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ username: string; userId?: number | null }>) {
      state.username = action.payload.username;
      state.userId = action.payload.userId ?? null;
      state.isAuthenticated = true;
      state.error = null;
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    logout(state) {
      state.username = '';
      state.userId = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const { loginSuccess, setAuthError, logout } = userSlice.actions;
export default userSlice.reducer;
