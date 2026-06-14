import { getFeedsApi } from '@api';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';

export const getFeeds = createAsyncThunk('feeds/fetchFeeds', getFeedsApi);

type TFeedSliceState = {
  isOrdersLoading: boolean;
  orders: TOrder[];
  error: null | string;
  total: number;
  totalToday: number;
};

const initialState: TFeedSliceState = {
  isOrdersLoading: false,
  orders: [],
  error: null,
  total: 0,
  totalToday: 0
};

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeeds.pending, (state) => {
        state.isOrdersLoading = true;
        state.error = null;
      })
      .addCase(getFeeds.fulfilled, (state, action) => {
        state.isOrdersLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(getFeeds.rejected, (state, action) => {
        state.isOrdersLoading = false;
        state.error = action.error.message || 'Не удалось загрузить ленту';
      });
  },
  selectors: {
    selectIsFeedOrdersLoading: (state) => state.isOrdersLoading,
    selectFeedOrders: (state) => state.orders,
    selectTotal: (state) => state.total,
    selectTotalToday: (state) => state.totalToday,
    selectFeedError: (state) => state.error
  }
});

export default feedSlice.reducer;

export const {
  selectIsFeedOrdersLoading,
  selectFeedOrders,
  selectTotal,
  selectTotalToday,
  selectFeedError
} = feedSlice.selectors;
