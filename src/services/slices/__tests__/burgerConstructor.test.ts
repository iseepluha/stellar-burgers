import burgerConstructorReducer, {
  addBun,
  addIngredient,
  removeIngredient,
  clearIngredients,
  closeModal,
  replaceIngredient,
  createOrder
} from '../constructorSlice';

import { TIngredient, TOrder } from '@utils-types';

jest.mock('@api', () => ({
  orderBurgerApi: jest.fn()
}));

const mockBun: TIngredient = {
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

const mockIngredient: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'https://code.s3.yandex.net/react/code/meat-01.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png'
};

const mockOrder: TOrder = {
  _id: '643d69a5c3f7b9001cfa094d',
  ingredients: [
    '643d69a5c3f7b9001cfa093c',
    '643d69a5c3f7b9001cfa0941',
    '643d69a5c3f7b9001cfa093c'
  ],
  status: 'done',
  name: 'Краторный биокотлетный бургер',
  createdAt: '2024-04-17T12:00:00.000Z',
  updatedAt: '2024-04-17T12:00:00.000Z',
  number: 54321
};

const buildTwoIngredientState = () => {
  let state = burgerConstructorReducer(
    initialState,
    addIngredient(mockIngredient)
  );
  state = burgerConstructorReducer(state, addIngredient(mockIngredient));
  return {
    state,
    firstId: state.constructorItems.ingredients[0].id,
    secondId: state.constructorItems.ingredients[1].id
  };
};

const initialState = {
  constructorItems: { bun: null, ingredients: [] },
  orderRequest: false,
  orderModalData: null
};

describe('burgerConstructorSlice reducer', () => {
  describe('неизвестный экшен', () => {
    it('должен вернуть начальное состояние при state = undefined', () => {
      const result = burgerConstructorReducer(undefined, { type: 'UNKNOWN' });
      expect(result).toEqual(initialState);
    });
  });

  describe('addBun', () => {
    it('должен установить булку в конструктор', () => {
      const result = burgerConstructorReducer(initialState, addBun(mockBun));
      expect(result.constructorItems.bun).toEqual(mockBun);
    });

    it('должен заменить уже выбранную булку', () => {
      const anotherBun: TIngredient = {
        ...mockBun,
        _id: 'other-id',
        name: 'Флюоресцентная булка'
      };
      let state = burgerConstructorReducer(initialState, addBun(mockBun));
      state = burgerConstructorReducer(state, addBun(anotherBun));

      expect(state.constructorItems.bun).toEqual(anotherBun);
    });
  });

  describe('addIngredient', () => {
    it('должен добавить ингредиент и присвоить ему уникальный id', () => {
      const result = burgerConstructorReducer(
        initialState,
        addIngredient(mockIngredient)
      );
      const added = result.constructorItems.ingredients[0];

      expect(result.constructorItems.ingredients).toHaveLength(1);
      expect(added).toMatchObject(mockIngredient);
      expect(typeof added.id).toBe('string');
      expect(added.id.length).toBeGreaterThan(0);
    });

    it('каждый вызов должен генерировать разный id', () => {
      let state = burgerConstructorReducer(
        initialState,
        addIngredient(mockIngredient)
      );
      state = burgerConstructorReducer(state, addIngredient(mockIngredient));
      const [first, second] = state.constructorItems.ingredients;

      expect(first.id).not.toBe(second.id);
    });
  });

  describe('removeIngredient', () => {
    it('должен удалить ингредиент по его nanoid-id', () => {
      let state = burgerConstructorReducer(
        initialState,
        addIngredient(mockIngredient)
      );
      const { id } = state.constructorItems.ingredients[0];

      state = burgerConstructorReducer(state, removeIngredient(id));

      expect(state.constructorItems.ingredients).toHaveLength(0);
    });

    it('не должен затрагивать остальные ингредиенты', () => {
      let state = burgerConstructorReducer(
        initialState,
        addIngredient(mockIngredient)
      );
      state = burgerConstructorReducer(state, addIngredient(mockIngredient));

      const idToRemove = state.constructorItems.ingredients[0].id;
      const idToKeep = state.constructorItems.ingredients[1].id;

      state = burgerConstructorReducer(state, removeIngredient(idToRemove));

      expect(state.constructorItems.ingredients).toHaveLength(1);
      expect(state.constructorItems.ingredients[0].id).toBe(idToKeep);
    });
  });

  describe('clearIngredients', () => {
    it('должен обнулить булку и очистить список ингредиентов', () => {
      const stateWithItems = {
        ...initialState,
        constructorItems: {
          bun: mockBun,
          ingredients: [{ ...mockIngredient, id: 'test-id' }]
        }
      };

      const result = burgerConstructorReducer(
        stateWithItems,
        clearIngredients()
      );

      expect(result.constructorItems.bun).toBeNull();
      expect(result.constructorItems.ingredients).toHaveLength(0);
    });
  });

  describe('closeModal', () => {
    it('должен сбросить orderModalData в null', () => {
      const stateWithModal = { ...initialState, orderModalData: mockOrder };

      const result = burgerConstructorReducer(stateWithModal, closeModal());

      expect(result.orderModalData).toBeNull();
    });
  });

  describe('replaceIngredient', () => {
    it('должен переместить ингредиент вверх', () => {
      const { state, firstId, secondId } = buildTwoIngredientState();

      const result = burgerConstructorReducer(
        state,
        replaceIngredient({ ingredientId: secondId, direction: 'up' })
      );

      expect(result.constructorItems.ingredients[0].id).toBe(secondId);
      expect(result.constructorItems.ingredients[1].id).toBe(firstId);
    });

    it('должен переместить ингредиент вниз', () => {
      const { state, firstId, secondId } = buildTwoIngredientState();

      const result = burgerConstructorReducer(
        state,
        replaceIngredient({ ingredientId: firstId, direction: 'down' })
      );

      expect(result.constructorItems.ingredients[0].id).toBe(secondId);
      expect(result.constructorItems.ingredients[1].id).toBe(firstId);
    });

    it('не должен перемещать первый ингредиент вверх (граничный случай)', () => {
      const { state, firstId, secondId } = buildTwoIngredientState();

      const result = burgerConstructorReducer(
        state,
        replaceIngredient({ ingredientId: firstId, direction: 'up' })
      );
      expect(result.constructorItems.ingredients[0].id).toBe(firstId);
      expect(result.constructorItems.ingredients[1].id).toBe(secondId);
    });

    it('не должен перемещать последний ингредиент вниз (граничный случай)', () => {
      const { state, firstId, secondId } = buildTwoIngredientState();

      const result = burgerConstructorReducer(
        state,
        replaceIngredient({ ingredientId: secondId, direction: 'down' })
      );

      expect(result.constructorItems.ingredients[0].id).toBe(firstId);
      expect(result.constructorItems.ingredients[1].id).toBe(secondId);
    });
  });

  describe('createOrder', () => {
    it('pending: должен установить orderRequest = true', () => {
      const action = createOrder.pending('requestId', undefined);

      const result = burgerConstructorReducer(initialState, action);

      expect(result.orderRequest).toBe(true);
    });

    it('fulfilled: должен записать данные заказа и сбросить orderRequest', () => {
      const action = createOrder.fulfilled(mockOrder, 'requestId', undefined);

      const result = burgerConstructorReducer(
        { ...initialState, orderRequest: true },
        action
      );

      expect(result.orderRequest).toBe(false);
      expect(result.orderModalData).toEqual(mockOrder);
    });

    it('rejected: должен сбросить orderRequest, не трогая остальное состояние', () => {
      const action = createOrder.rejected(
        new Error('Ошибка заказа'),
        'requestId',
        undefined
      );

      const result = burgerConstructorReducer(
        { ...initialState, orderRequest: true },
        action
      );

      expect(result.orderRequest).toBe(false);
      expect(result.orderModalData).toBeNull();
    });
  });
});
