import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Event, PaginatedResponse } from '@nextdoor-clone/shared';
import apiClient from '../../services/api';

interface EventsState {
  events: Event[];
  selectedEvent: Event | null;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  selectedEvent: null,
  page: 1,
  hasMore: true,
  isLoading: false,
  error: null,
};

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params: { page?: number; refresh?: boolean } = {}, { rejectWithValue }) => {
    try {
      const { page = 1 } = params;
      const res = await apiClient.get<{ data: PaginatedResponse<Event> }>('/events', {
        params: { page, limit: 20 },
      });
      return { ...res.data.data, page };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to load events');
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (payload: Partial<Event>, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/events', payload);
      return res.data.data as Event;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create event');
    }
  }
);

export const rsvpEvent = createAsyncThunk(
  'events/rsvpEvent',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(`/events/${eventId}/rsvp`);
      return { eventId, ...res.data.data };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to RSVP');
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setSelectedEvent(state, action) {
      state.selectedEvent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, hasMore, page } = action.payload;
        state.events = page === 1 ? data : [...state.events, ...data];
        state.page = page;
        state.hasMore = hasMore;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.events.unshift(action.payload);
      })
      .addCase(rsvpEvent.fulfilled, (state, action) => {
        const event = state.events.find((e) => e.id === action.payload.eventId);
        if (event) {
          event.isRsvpedByMe = action.payload.isRsvped;
          event.rsvpCount = action.payload.rsvpCount;
        }
      });
  },
});

export const { setSelectedEvent } = eventsSlice.actions;
export default eventsSlice.reducer;
