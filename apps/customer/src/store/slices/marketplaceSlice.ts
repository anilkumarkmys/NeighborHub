import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MarketplaceListing, PaginatedResponse } from '@nextdoor-clone/shared';
import apiClient from '../../services/api';

interface MarketplaceState {
  listings: MarketplaceListing[];
  selectedListing: MarketplaceListing | null;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  filter: { category?: string; minPrice?: number; maxPrice?: number; isFree?: boolean };
}

const initialState: MarketplaceState = {
  listings: [],
  selectedListing: null,
  page: 1,
  hasMore: true,
  isLoading: false,
  error: null,
  filter: {},
};

export const fetchListings = createAsyncThunk(
  'marketplace/fetchListings',
  async (params: { page?: number; filter?: MarketplaceState['filter'] } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, filter = {} } = params;
      const res = await apiClient.get<{ data: PaginatedResponse<MarketplaceListing> }>(
        '/marketplace',
        { params: { page, limit: 20, ...filter } }
      );
      return { ...res.data.data, page };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to load listings');
    }
  }
);

export const createListing = createAsyncThunk(
  'marketplace/createListing',
  async (payload: Partial<MarketplaceListing>, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/marketplace', payload);
      return res.data.data as MarketplaceListing;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create listing');
    }
  }
);

export const markAsSold = createAsyncThunk(
  'marketplace/markAsSold',
  async (listingId: string, { rejectWithValue }) => {
    try {
      await apiClient.patch(`/marketplace/${listingId}`, { status: 'sold' });
      return listingId;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update listing');
    }
  }
);

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload;
      state.listings = [];
      state.page = 1;
    },
    setSelectedListing(state, action) {
      state.selectedListing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListings.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, hasMore, page } = action.payload;
        state.listings = page === 1 ? data : [...state.listings, ...data];
        state.page = page;
        state.hasMore = hasMore;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.listings.unshift(action.payload);
      })
      .addCase(markAsSold.fulfilled, (state, action) => {
        const listing = state.listings.find((l) => l.id === action.payload);
        if (listing) listing.status = 'sold';
      });
  },
});

export const { setFilter, setSelectedListing } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;
