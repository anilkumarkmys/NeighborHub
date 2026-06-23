import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '@nextdoor-clone/shared';
import apiClient from '../../services/api';

interface NeighborsState {
  neighbors: User[];
  selectedNeighbor: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: NeighborsState = {
  neighbors: [],
  selectedNeighbor: null,
  isLoading: false,
  error: null,
};

export const fetchNeighbors = createAsyncThunk(
  'neighbors/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/neighbors');
      return res.data.data as User[];
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to load neighbors');
    }
  }
);

const neighborsSlice = createSlice({
  name: 'neighbors',
  initialState,
  reducers: {
    setSelectedNeighbor(state, action) {
      state.selectedNeighbor = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNeighbors.pending, (state) => { state.isLoading = true; })
      .addCase(fetchNeighbors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.neighbors = action.payload;
      })
      .addCase(fetchNeighbors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedNeighbor } = neighborsSlice.actions;
export default neighborsSlice.reducer;
