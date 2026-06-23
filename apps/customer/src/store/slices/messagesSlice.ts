import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Conversation, Message } from '@nextdoor-clone/shared';
import apiClient from '../../services/api';

interface MessagesState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<string, Message[]>;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/messages/conversations');
      return res.data.data as Conversation[];
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to load conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/messages/conversations/${conversationId}`);
      return { conversationId, messages: res.data.data as Message[] };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to load messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (
    payload: { conversationId?: string; recipientId?: string; content: string; images?: string[] },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post('/messages/send', payload);
      return res.data.data as { conversation: Conversation; message: Message };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to send message');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setActiveConversation(state, action) {
      state.activeConversation = action.payload;
    },
    addMessage(state, action) {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
    },
    markRead(state, action) {
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv && conv.unreadCount > 0) {
        state.unreadCount -= conv.unreadCount;
        conv.unreadCount = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => { state.isLoading = true; })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
        state.unreadCount = action.payload.reduce((sum, c) => sum + c.unreadCount, 0);
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages[action.payload.conversationId] = action.payload.messages;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversation, message } = action.payload;
        const existing = state.conversations.find((c) => c.id === conversation.id);
        if (existing) {
          existing.lastMessage = message;
        } else {
          state.conversations.unshift(conversation);
        }
        const convId = conversation.id;
        if (!state.messages[convId]) state.messages[convId] = [];
        state.messages[convId].push(message);
      });
  },
});

export const { setActiveConversation, addMessage, markRead } = messagesSlice.actions;
export default messagesSlice.reducer;
