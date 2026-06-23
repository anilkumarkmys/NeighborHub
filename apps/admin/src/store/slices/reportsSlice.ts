import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Report, PaginatedResponse } from '@nextdoor-clone/shared';
import apiClient from '../../services/api';

interface ReportsState {
  reports: Report[];
  selectedReport: Report | null;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  reports: [],
  selectedReport: null,
  page: 1,
  hasMore: true,
  isLoading: false,
  error: null,
};

export const fetchReports = createAsyncThunk(
  'reports/fetch',
  async (params: { page?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, status = 'pending' } = params;
      const res = await apiClient.get<{ data: PaginatedResponse<Report> }>('/admin/reports', {
        params: { page, limit: 20, status },
      });
      return { ...res.data.data, page };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to load reports');
    }
  }
);

export const resolveReport = createAsyncThunk(
  'reports/resolve',
  async (payload: { reportId: string; action: 'resolved' | 'dismissed'; adminNote?: string }, { rejectWithValue }) => {
    try {
      await apiClient.post(`/admin/reports/${payload.reportId}/resolve`, {
        action: payload.action,
        adminNote: payload.adminNote,
      });
      return payload.reportId;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to resolve report');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setSelectedReport(state, action) { state.selectedReport = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => { state.isLoading = true; })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, hasMore, page } = action.payload;
        state.reports = page === 1 ? data : [...state.reports, ...data];
        state.page = page;
        state.hasMore = hasMore;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(resolveReport.fulfilled, (state, action) => {
        state.reports = state.reports.filter((r) => r.id !== action.payload);
      });
  },
});

export const { setSelectedReport } = reportsSlice.actions;
export default reportsSlice.reducer;
