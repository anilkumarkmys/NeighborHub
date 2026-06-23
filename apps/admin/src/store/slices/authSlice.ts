import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthTokens } from '@nextdoor-clone/shared';
import apiClient from '../../services/api';

interface AdminAuthState {
  admin: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminAuthState = {
  admin: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/admin/auth/login', payload);
      const { user, tokens } = res.data.data;
      if (user.role !== 'admin' && user.role !== 'moderator') {
        return rejectWithValue('Access denied. Admin credentials required.');
      }
      await AsyncStorage.setItem('adminAccessToken', tokens.accessToken);
      await AsyncStorage.setItem('adminRefreshToken', tokens.refreshToken);
      return { user, tokens };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const loadAdminSession = createAsyncThunk('auth/loadAdminSession', async () => {
  const token = await AsyncStorage.getItem('adminAccessToken');
  if (!token) return null;
  const res = await apiClient.get('/admin/auth/me');
  const user = res.data.data as User;
  if (user.role !== 'admin' && user.role !== 'moderator') return null;
  return { user, tokens: { accessToken: token } as AuthTokens };
});

export const logoutAdmin = createAsyncThunk('auth/logoutAdmin', async () => {
  await AsyncStorage.multiRemove(['adminAccessToken', 'adminRefreshToken']);
  await apiClient.post('/admin/auth/logout').catch(() => {});
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admin = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(loadAdminSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.admin = action.payload.user;
          state.tokens = action.payload.tokens;
          state.isAuthenticated = true;
        }
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.admin = null;
        state.tokens = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
