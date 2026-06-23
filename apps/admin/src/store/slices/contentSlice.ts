import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Post, PaginatedResponse } from '@nextdoor-clone/shared';
import apiClient from '../../services/api';

interface ContentState {
  posts: Post[];
  flaggedPosts: Post[];
  selectedPost: Post | null;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: ContentState = {
  posts: [],
  flaggedPosts: [],
  selectedPost: null,
  page: 1,
  hasMore: true,
  isLoading: false,
  error: null,
};

export const fetchFlaggedContent = createAsyncThunk(
  'content/fetchFlagged',
  async (params: { page?: number } = {}, { rejectWithValue }) => {
    try {
      const { page = 1 } = params;
      const res = await apiClient.get<{ data: PaginatedResponse<Post> }>('/admin/content/flagged', {
        params: { page, limit: 20 },
      });
      return { ...res.data.data, page };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to load content');
    }
  }
);

export const approveContent = createAsyncThunk('content/approve', async (postId: string, { rejectWithValue }) => {
  try {
    await apiClient.post(`/admin/content/${postId}/approve`);
    return postId;
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to approve');
  }
});

export const removeContent = createAsyncThunk(
  'content/remove',
  async (payload: { postId: string; reason: string }, { rejectWithValue }) => {
    try {
      await apiClient.post(`/admin/content/${payload.postId}/remove`, { reason: payload.reason });
      return payload.postId;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to remove');
    }
  }
);

export const pinContent = createAsyncThunk('content/pin', async (postId: string, { rejectWithValue }) => {
  try {
    await apiClient.post(`/admin/content/${postId}/pin`);
    return postId;
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to pin');
  }
});

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setSelectedPost(state, action) { state.selectedPost = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlaggedContent.pending, (state) => { state.isLoading = true; })
      .addCase(fetchFlaggedContent.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, hasMore, page } = action.payload;
        state.flaggedPosts = page === 1 ? data : [...state.flaggedPosts, ...data];
        state.page = page;
        state.hasMore = hasMore;
      })
      .addCase(fetchFlaggedContent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(approveContent.fulfilled, (state, action) => {
        state.flaggedPosts = state.flaggedPosts.filter((p) => p.id !== action.payload);
      })
      .addCase(removeContent.fulfilled, (state, action) => {
        state.flaggedPosts = state.flaggedPosts.filter((p) => p.id !== action.payload);
      })
      .addCase(pinContent.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p.id === action.payload);
        if (post) post.isPinnedByAdmin = true;
      });
  },
});

export const { setSelectedPost } = contentSlice.actions;
export default contentSlice.reducer;
