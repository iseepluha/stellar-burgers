import {
  createAsyncThunk,
  createSlice,
  nanoid,
  PayloadAction
} from '@reduxjs/toolkit';
import { TConstructorIngredient, TIngredient, TOrder } from 'src/utils/types';
import { orderBurgerApi } from '@api';
import { RootState } from '../store';

type TConstructorItems = {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
};

type TConstructorState = {
  constructorItems: TConstructorItems;
  orderRequest: boolean;
  orderModalData: null | TOrder;
};

const initialState: TConstructorState = {
  constructorItems: {
    bun: null,
    ingredients: []
  },
  orderRequest: false,
  orderModalData: null
};

export const createOrder = createAsyncThunk<TOrder, void, { state: RootState }>(
  'burgerConstructor/createOrder',
  async (_, { getState, rejectWithValue }) => {
    const { bun, ingredients } = getState().burgerConstructor.constructorItems;

    if (!bun) {
      return rejectWithValue('Выберите булку');
    }

    const ingredientIds = [
      bun._id,
      ...ingredients.map((ingredient) => ingredient._id),
      bun._id
    ];

    try {
      const response = await orderBurgerApi(ingredientIds);
      return {
        ...response.order,
        ingredients: ingredientIds
      };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Произошла непредвиденная ошибка');
    }
  }
);

export const burgerConstructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addBun: (state, action: PayloadAction<TIngredient>) => {
      state.constructorItems.bun = action.payload;
    },
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        state.constructorItems.ingredients.push(action.payload);
      },
      prepare: (ingredient: TIngredient) => {
        const id = nanoid();
        return { payload: { ...ingredient, id } };
      }
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.constructorItems.ingredients =
        state.constructorItems.ingredients.filter(
          (ingredient) => ingredient.id !== action.payload
        );
    },
    clearIngredients: (state) => {
      state.constructorItems.bun = null;
      state.constructorItems.ingredients = [];
    },
    closeModal: (state) => {
      state.orderModalData = null;
    },
    replaceIngredient: (state, action) => {
      const { ingredientId, direction } = action.payload;
      const ingredients = state.constructorItems.ingredients;
      const currentIndex = ingredients.findIndex(
        (ingredient) => ingredient.id === ingredientId
      );

      if (direction === 'up' && currentIndex > 0) {
        const [movedIngredient] = ingredients.splice(currentIndex, 1);
        ingredients.splice(currentIndex - 1, 0, movedIngredient);
      }

      if (direction === 'down' && currentIndex < ingredients.length - 1) {
        const [movedIngredient] = ingredients.splice(currentIndex, 1);
        ingredients.splice(currentIndex + 1, 0, movedIngredient);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
      })
      .addCase(
        createOrder.fulfilled,
        (state, action: PayloadAction<TOrder>) => {
          state.orderRequest = false;
          state.orderModalData = action.payload;
        }
      )
      .addCase(createOrder.rejected, (state) => {
        state.orderRequest = false;
      });
  }
});

export default burgerConstructorSlice.reducer;

export const {
  addBun,
  addIngredient,
  removeIngredient,
  closeModal,
  clearIngredients,
  replaceIngredient
} = burgerConstructorSlice.actions;
