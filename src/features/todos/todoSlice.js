import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchTodoLists = createAsyncThunk(
  'todos/fetchTodoLists',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/api/todos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createTodoList = createAsyncThunk(
  'todos/createTodoList',
  async (name, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(`${API_URL}/api/todos`, 
        { name },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addTask = createAsyncThunk(
  'todos/addTask',
  async ({ listId, text }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/api/todos/${listId}/tasks`,
        { text },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'todos/updateTaskStatus',
  async ({ listId, taskId, status }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.patch(
        `${API_URL}/api/todos/${listId}/tasks/${taskId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  lists: [],
  status: 'idle',
  error: null
};

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodoLists.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTodoLists.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lists = action.payload;
      })
      .addCase(fetchTodoLists.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch todo lists';
      })
      .addCase(createTodoList.fulfilled, (state, action) => {
        state.lists.push(action.payload);
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const index = state.lists.findIndex(list => list._id === action.payload._id);
        if (index !== -1) {
          state.lists[index] = action.payload;
        }
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.lists.findIndex(list => list._id === action.payload._id);
        if (index !== -1) {
          state.lists[index] = action.payload;
        }
      });
  }
});

export const { clearError } = todoSlice.actions;
export default todoSlice.reducer;
