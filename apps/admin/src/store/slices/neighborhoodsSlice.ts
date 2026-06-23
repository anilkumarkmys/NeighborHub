import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Neighborhood } from '@nextdoor-clone/shared';
import apiClient from '../../services/api';

interface NeighborhoodsState {
  neighborhoods: Neighborhood[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NeighborhoodsState = { neighborhoods: [], isLoading: false, error: null };

export const fetchNeighborhoods = createAsyncThunk('neighborhoods/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/admin/neighborhoods');
    return res.data.data as Neighborhood[];
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to load');
  }
});

export const toggleNeighborhood = createAsyncThunk(
  'neighborhoods/toggle',
  async (payload: { id: string; isActive: boolean }, { rejectWithValue }) => {
    try {
      await apiClient.patch(`/admin/neighborhoods/${payload.id}`, { isActive: payload.isActive });
      return payload;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update');
    }
  }
);

const neighborhoodsSlice = createSlice({
  name: 'neighborhoods',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNeighborhoods.pending, (state) => { state.isLoading = true; })
      .addCase(fetchNeighborhoods.fulfilled, (state, action) => { state.isLoading = false; state.neighborhoods = action.payload; })
      .addCase(fetchNeighborhoods.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })
      .addCase(toggleNeighborhood.fulfilled, (state, action) => {
        const n = state.neighborhoods.find((n) => n.id === action.payload.id);
        if (n) n.isActive = action.payload.isActive;
      });
  },
});

export default neighborhoodsSlice.reducer;
