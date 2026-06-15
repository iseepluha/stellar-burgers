import ingredientsReducer, { fetchIngredients } from '../ingredientsSlice';

import { TIngredient } from 'src/utils/types';

jest.mock('@api', () => ({
  getIngredientsApi: jest.fn()
}));

const mockIngredient: TIngredient = {
  _id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'https://code.s3.yandex.net/react/code/bun-02.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png'
};

describe('ingredientsSlice reducer', () => {
  const initialState = {
    isIngredientsLoading: false,
    ingredients: [],
    error: null
  };

  describe('неизвестный экшен', () => {
    it('должен вернуть начальное состояние при state = undefined', () => {
      const result = ingredientsReducer(undefined, { type: 'UNKNOWN' });
      expect(result).toEqual(initialState);
    });
  });

  describe('fetchIngredients.pending', () => {
    it('должен установить isIngredientsLoading = true и сбросить ошибку', () => {
      const stateWithError = { ...initialState, error: 'old error' };

      const action = fetchIngredients.pending('requestId', undefined);

      const result = ingredientsReducer(stateWithError, action);

      expect(result.isIngredientsLoading).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('fetchIngredients.fulfilled', () => {
    it('должен записать ингредиенты и завершить загрузку', () => {
      const ingredients: TIngredient[] = [mockIngredient];
      const action = fetchIngredients.fulfilled(
        ingredients,
        'requestId',
        undefined
      );

      const result = ingredientsReducer(
        { ...initialState, isIngredientsLoading: true },
        action
      );

      expect(result.isIngredientsLoading).toBe(false);
      expect(result.ingredients).toEqual(ingredients);
    });
  });

  describe('fetchIngredients.rejected', () => {
    it('должен записать сообщение из Error и завершить загрузку', () => {
      const error = new Error('Ошибка сети');
      const action = fetchIngredients.rejected(error, 'requestId', undefined);

      const result = ingredientsReducer(
        { ...initialState, isIngredientsLoading: true },
        action
      );

      expect(result.isIngredientsLoading).toBe(false);
      expect(result.error).toBe('Ошибка сети');
    });

    it('должен использовать дефолтное сообщение, если сообщение об ошибке отсутствует', () => {
      const action = fetchIngredients.rejected(null, 'requestId', undefined);
      action.error.message = undefined;
      const result = ingredientsReducer(
        { ...initialState, isIngredientsLoading: true },
        action
      );
      expect(result.isIngredientsLoading).toBe(false);
      expect(result.error).toBe('Произошла ошибка при загрузке ингредиентов');
    });
  });
});
