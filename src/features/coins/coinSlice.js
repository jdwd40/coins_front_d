import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching coins
export const fetchCoins = createAsyncThunk(
  'coins/fetchCoins',
  async (_, { getState }) => {
    const { auth: { token } } = getState();
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/coins`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
);

// Initialize coins (development only)
export const initializeCoins = createAsyncThunk(
  'coins/initializeCoins',
  async (_, { getState }) => {
    const { auth: { token } } = getState();
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/coins/init`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
);

const coinSlice = createSlice({
  name: 'coins',
  initialState: {
    coins: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoins.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCoins.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.coins = action.payload;
      })
      .addCase(fetchCoins.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(initializeCoins.fulfilled, (state) => {
        state.status = 'idle';
      });
  }
});

export default coinSlice.reducer;
