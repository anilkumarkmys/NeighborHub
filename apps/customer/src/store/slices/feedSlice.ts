import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, PostCategory, PaginatedResponse } from '@nextdoor-clone/shared';
import apiClient from '../../services/api';

interface FeedState {
  posts: Post[];
  selectedPost: Post | null;
  category: PostCategory | 'all';
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

const initialState: FeedState = {
  posts: [],
  selectedPost: null,
  category: 'all',
  page: 1,
  hasMore: true,
  isLoading: false,
  isRefreshing: false,
  error: null,
};

export const fetchPosts = createAsyncThunk(
  'feed/fetchPosts',
  async (params: { page?: number; category?: string; refresh?: boolean } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, category = 'all' } = params;
      const res = await apiClient.get<{ data: PaginatedResponse<Post> }>('/posts', {
        params: { page, limit: 20, ...(category !== 'all' ? { category } : {}) },
      });
      return { ...res.data.data, page };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to load posts');
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'feed/fetchPostById',
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/posts/${postId}`);
      return res.data.data as Post;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to load post');
    }
  }
);

export const createPost = createAsyncThunk(
  'feed/createPost',
  async (
    payload: { category: PostCategory; title: string; content: string; images?: string[] },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post('/posts', payload);
      return res.data.data as Post;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create post');
    }
  }
);

export const thankPost = createAsyncThunk(
  'feed/thankPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(`/posts/${postId}/thank`);
      return { postId, ...res.data.data };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to thank post');
    }
  }
);

export const reportPost = createAsyncThunk(
  'feed/reportPost',
  async (payload: { postId: string; reason: string; description?: string }, { rejectWithValue }) => {
    try {
      await apiClient.post(`/posts/${payload.postId}/report`, {
        reason: payload.reason,
        description: payload.description,
      });
      return payload.postId;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to report post');
    }
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<PostCategory | 'all'>) {
      state.category = action.payload;
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
    },
    clearFeed(state) {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        if (action.meta.arg.refresh) state.isRefreshing = true;
        else state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        const { data, hasMore, page } = action.payload;
        state.posts = page === 1 ? data : [...state.posts, ...data];
        state.page = page;
        state.hasMore = hasMore;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.selectedPost = action.payload;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(thankPost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p.id === action.payload.postId);
        if (post) {
          post.isThankedByMe = action.payload.isThanked;
          post.thankCount = action.payload.thankCount;
        }
      });
  },
});

export const { setCategory, clearFeed, clearError } = feedSlice.actions;
export default feedSlice.reducer;
