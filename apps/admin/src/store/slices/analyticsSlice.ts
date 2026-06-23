import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Analytics } from '@nextdoor-clone/shared';
import apiClient from '../../services/api';

interface AnalyticsState {
  summary: Analytics | null;
  userGrowth: Array<{ date: string; count: number }>;
  postActivity: Array<{ date: string; count: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  summary: null,
  userGrowth: [],
  postActivity: [],
  categoryDistribution: [],
  isLoading: false,
  error: null,
};

export const fetchAnalytics = createAsyncThunk('analytics/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/admin/analytics');
    return res.data.data;
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to load analytics');
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload.summary;
        state.userGrowth = action.payload.userGrowth || [];
        state.postActivity = action.payload.postActivity || [];
        state.categoryDistribution = action.payload.categoryDistribution || [];
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default analyticsSlice.reducer;
