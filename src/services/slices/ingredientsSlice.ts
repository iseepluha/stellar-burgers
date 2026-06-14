import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TIngredient } from 'src/utils/types';
import { getIngredientsApi } from '@api';

type TIngredientsState = {
  isIngredientsLoading: boolean;
  ingredients: TIngredient[];
  error: null | string;
};

const initialState: TIngredientsState = {
  isIngredientsLoading: false,
  ingredients: [],
  error: null
};

export const fetchIngredients = createAsyncThunk(
  'ingredients/fetchIngredients',
  getIngredientsApi
);

export const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isIngredientsLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.isIngredientsLoading = false;
        state.ingredients = action.payload;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.isIngredientsLoading = false;
        state.error =
          action.error.message ?? 'Произошла ошибка при загрузке ингредиентов';
      });
  },
  selectors: {
    selectIsIngredientsLoading: (state) => state.isIngredientsLoading,
    selectIngredients: (state) => state.ingredients,
    selectIngredientsError: (state) => state.error
  }
});

export default ingredientsSlice.reducer;

export const {
  selectIsIngredientsLoading,
  selectIngredients,
  selectIngredientsError
} = ingredientsSlice.selectors;
