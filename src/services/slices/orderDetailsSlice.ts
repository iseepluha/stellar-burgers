import { getOrderByNumberApi } from '@api';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';

export const getOrder = createAsyncThunk(
  'orders/getOrder',
  async (number: number) => {
    const data = await getOrderByNumberApi(number);
    return data.orders;
  }
);

type TOrderDetailsSliceState = {
  orders: TOrder[];
  isLoading: boolean;
  error: string | null;
};

const initialState: TOrderDetailsSliceState = {
  orders: [],
  isLoading: false,
  error: null
};

export const orderDetailsSlice = createSlice({
  name: 'orderDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOrder.pending, (state, action) => {
        state.error = null;
        state.isLoading = true;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message || 'Не удалось загрузить детали заказа';
      });
  }
});

export default orderDetailsSlice.reducer;
