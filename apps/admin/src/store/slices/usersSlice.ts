import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User, PaginatedResponse } from '@nextdoor-clone/shared';
import apiClient from '../../services/api';

interface UsersState {
  users: User[];
  selectedUser: User | null;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  search: string;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  page: 1,
  hasMore: true,
  isLoading: false,
  error: null,
  search: '',
};

export const fetchUsers = createAsyncThunk(
  'users/fetch',
  async (params: { page?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, search = '' } = params;
      const res = await apiClient.get<{ data: PaginatedResponse<User> }>('/admin/users', {
        params: { page, limit: 20, ...(search ? { search } : {}) },
      });
      return { ...res.data.data, page };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to load users');
    }
  }
);

export const fetchUserById = createAsyncThunk('users/fetchById', async (userId: string, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`/admin/users/${userId}`);
    return res.data.data as User;
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to load user');
  }
});

export const suspendUser = createAsyncThunk(
  'users/suspend',
  async (payload: { userId: string; reason: string; duration?: number }, { rejectWithValue }) => {
    try {
      await apiClient.post(`/admin/users/${payload.userId}/suspend`, { reason: payload.reason, duration: payload.duration });
      return payload.userId;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to suspend user');
    }
  }
);

export const banUser = createAsyncThunk(
  'users/ban',
  async (payload: { userId: string; reason: string }, { rejectWithValue }) => {
    try {
      await apiClient.post(`/admin/users/${payload.userId}/ban`, { reason: payload.reason });
      return payload.userId;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to ban user');
    }
  }
);

export const reactivateUser = createAsyncThunk('users/reactivate', async (userId: string, { rejectWithValue }) => {
  try {
    await apiClient.post(`/admin/users/${userId}/reactivate`);
    return userId;
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to reactivate user');
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearch(state, action) { state.search = action.payload; },
    setSelectedUser(state, action) { state.selectedUser = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, hasMore, page } = action.payload;
        state.users = page === 1 ? data : [...state.users, ...data];
        state.page = page;
        state.hasMore = hasMore;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      .addCase(suspendUser.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.id === action.payload);
        if (user) user.isActive = false;
      })
      .addCase(banUser.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.id === action.payload);
        if (user) user.isActive = false;
      })
      .addCase(reactivateUser.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.id === action.payload);
        if (user) user.isActive = true;
      });
  },
});

export const { setSearch, setSelectedUser } = usersSlice.actions;
export default usersSlice.reducer;
