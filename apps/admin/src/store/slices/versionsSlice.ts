import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AppVersion } from '@nextdoor-clone/shared';
import apiClient from '../../services/api';

interface VersionsState {
  versions: AppVersion[];
  isLoading: boolean;
  error: string | null;
}

const initialState: VersionsState = {
  versions: [],
  isLoading: false,
  error: null,
};

export const fetchVersions = createAsyncThunk('versions/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/admin/versions');
    return res.data.data as AppVersion[];
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to load versions');
  }
});

export const createVersion = createAsyncThunk(
  'versions/create',
  async (payload: Partial<AppVersion>, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/admin/versions', payload);
      return res.data.data as AppVersion;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create version');
    }
  }
);

export const releaseVersion = createAsyncThunk('versions/release', async (versionId: string, { rejectWithValue }) => {
  try {
    const res = await apiClient.post(`/admin/versions/${versionId}/release`);
    return res.data.data as AppVersion;
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to release version');
  }
});

export const setForceUpdate = createAsyncThunk(
  'versions/setForceUpdate',
  async (payload: { versionId: string; isForceUpdate: boolean }, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch(`/admin/versions/${payload.versionId}`, { isForceUpdate: payload.isForceUpdate });
      return res.data.data as AppVersion;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update');
    }
  }
);

const versionsSlice = createSlice({
  name: 'versions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVersions.pending, (state) => { state.isLoading = true; })
      .addCase(fetchVersions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.versions = action.payload;
      })
      .addCase(fetchVersions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createVersion.fulfilled, (state, action) => {
        state.versions.unshift(action.payload);
      })
      .addCase(releaseVersion.fulfilled, (state, action) => {
        const v = state.versions.find((v) => v.id === action.payload.id);
        if (v) Object.assign(v, action.payload);
      })
      .addCase(setForceUpdate.fulfilled, (state, action) => {
        const v = state.versions.find((v) => v.id === action.payload.id);
        if (v) v.isForceUpdate = action.payload.isForceUpdate;
      });
  },
});

export default versionsSlice.reducer;
