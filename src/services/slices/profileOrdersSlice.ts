import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrdersApi } from '@api';
import { TOrder } from '@utils-types';

export const getProfileOrders = createAsyncThunk(
  'profileOrders/getOrders',
  getOrdersApi
);

type TProfileOrderSliceState = {
  orders: TOrder[];
  isLoading: boolean;
  error: null | string;
};

const initialState: TProfileOrderSliceState = {
  orders: [],
  isLoading: false,
  error: null
};

export const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProfileOrders.pending, (state) => {
        state.error = null;
        state.isLoading = true;
      })
      .addCase(getProfileOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.isLoading = false;
      })
      .addCase(getProfileOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message || 'Не удалось загрузить ваши заказы';
      });
  }
});

export default profileOrdersSlice.reducer;
