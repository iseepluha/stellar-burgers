import { resolve } from 'path';
import { test, expect, Page, BrowserContext } from '@playwright/test';

const HARS_PATH = resolve(__dirname, 'hars');
const USER_MOCK_NAME = 'iseepluha';
const ORDER_MOCK_ID = '676767';
const TOKEN_ACCESS = 'mock-access-token';
const TOKEN_REFRESH = 'mock-refresh-token';
const TARGET_BUN = 'Краторная булка N-200i';
const TARGET_BUN_ID = '643d69a5c3f7b9001cfa093c';
const TARGET_FILLING = 'Биокотлета из марсианской Магнолии';

const findConstructorArea = (page: Page) =>
  page.locator('section').filter({
    has: page.getByRole('button', { name: 'Оформить заказ' })
  });

const findOrderModal = (page: Page) =>
  page.locator('#modals > div').filter({
    has: page.getByText('идентификатор заказа', { exact: true })
  });

const findIngredientModal = (page: Page) =>
  page.locator('#modals > div').filter({
    has: page.getByRole('heading', { name: 'Детали ингредиента' })
  });

const initIngredientsHar = async (page: Page) => {
  await page.routeFromHAR(resolve(HARS_PATH, 'ingredients.har'), {
    url: '**/ingredients',
    update: false
  });
};

const initAllApiHars = async (page: Page) => {
  await initIngredientsHar(page);

  await page.route('**/auth/user', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: {
          email: 'test@test.com',
          name: USER_MOCK_NAME
        }
      })
    });
  });

  await page.route('**/orders', (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          order: {
            number: Number(ORDER_MOCK_ID)
          }
        })
      });
    } else {
      route.continue();
    }
  });
};

const applyAuthTokens = async (context: BrowserContext) => {
  await context.addCookies([
    {
      name: 'accessToken',
      value: TOKEN_ACCESS,
      url: 'http://localhost:4000'
    }
  ]);

  await context.addInitScript((token) => {
    localStorage.setItem('refreshToken', token);
  }, TOKEN_REFRESH);
};

const selectIngredient = async (page: Page, ingredientName: string) => {
  await page
    .locator('li')
    .filter({ hasText: ingredientName })
    .getByRole('button', { name: 'Добавить' })
    .click();
};

const makeBurger = async (page: Page) => {
  await selectIngredient(page, TARGET_BUN);
  await selectIngredient(page, TARGET_FILLING);
};

const checkConstructorIsEmpty = async (page: Page) => {
  const container = findConstructorArea(page);
  await expect(container.getByText('Выберите булки')).toHaveCount(2);
  await expect(container.getByText('Выберите начинку')).toBeVisible();
};

const checkConstructorHasItems = async (page: Page) => {
  const container = findConstructorArea(page);
  await expect(container.getByText(`${TARGET_BUN} (верх)`)).toBeVisible();
  await expect(container.getByText(`${TARGET_BUN} (низ)`)).toBeVisible();
  await expect(
    container.locator('ul li').filter({ hasText: TARGET_FILLING })
  ).toBeVisible();
  await expect(container.getByText('Выберите булки')).toBeHidden();
  await expect(container.getByText('Выберите начинку')).toBeHidden();
};

test.describe('Подмена данных об ингредиентах', () => {
  test('успешная отрисовка списка ингредиентов из мока', async ({ page }) => {
    await initIngredientsHar(page);
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'Соберите бургер' })
    ).toBeVisible();
    await expect(page.getByText(TARGET_BUN)).toBeVisible();
    await expect(page.getByText(TARGET_FILLING)).toBeVisible();
  });
});

test.describe('Пользовательские данные и оформление заказа (HAR)', () => {
  test.beforeEach(async ({ page, context }) => {
    await initAllApiHars(page);
    await applyAuthTokens(context);
  });

  test('корректная обработка мокового ответа профиля', async ({ page }) => {
    const responseTracker = page.waitForResponse(
      (res) => res.url().includes('/auth/user') && res.status() === 200
    );

    await page.goto('/');

    const resolvedResponse = await responseTracker;
    const body = await resolvedResponse.json();

    expect(body.success).toBe(true);
    expect(body.user).toEqual({
      email: 'test@test.com',
      name: USER_MOCK_NAME
    });
  });

  test('e2e процесс отправки заказа', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Соберите бургер' })
    ).toBeVisible();

    const lsToken = await page.evaluate(() =>
      localStorage.getItem('refreshToken')
    );
    expect(lsToken).toBe(TOKEN_REFRESH);

    const activeCookies = await page.context().cookies('http://localhost:4000');
    expect(activeCookies.find((c) => c.name === 'accessToken')?.value).toBe(
      TOKEN_ACCESS
    );

    await makeBurger(page);
    await checkConstructorHasItems(page);

    const postOrderTracker = page.waitForResponse(
      (res) =>
        res.url().includes('/orders') &&
        res.request().method() === 'POST' &&
        res.status() === 200
    );

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const orderRes = await postOrderTracker;
    const orderData = await orderRes.json();

    expect(orderData.success).toBe(true);
    expect(orderData.order.number).toBe(Number(ORDER_MOCK_ID));

    const modalWindow = findOrderModal(page);

    await expect(
      modalWindow.getByRole('heading', { name: ORDER_MOCK_ID })
    ).toBeVisible();
    await expect(
      modalWindow.getByText('идентификатор заказа', { exact: true })
    ).toBeVisible();

    await checkConstructorIsEmpty(page);

    await modalWindow.locator('button').click();

    await expect(modalWindow).toBeHidden();
    await checkConstructorIsEmpty(page);
  });
});

test.describe('Сборка бургера в конструкторе', () => {
  test.beforeEach(async ({ page }) => {
    await initIngredientsHar(page);
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Соберите бургер' })
    ).toBeVisible();
  });

  test('интерактивное добавление булок и начинки', async ({ page }) => {
    await checkConstructorIsEmpty(page);

    await selectIngredient(page, TARGET_BUN);
    const container = findConstructorArea(page);

    await expect(container.getByText(`${TARGET_BUN} (верх)`)).toBeVisible();
    await expect(container.getByText(`${TARGET_BUN} (низ)`)).toBeVisible();
    await expect(container.getByText('Выберите булки')).toBeHidden();
    await expect(container.getByText('Выберите начинку')).toBeVisible();

    await selectIngredient(page, TARGET_FILLING);

    await expect(
      container.locator('ul li').filter({ hasText: TARGET_FILLING })
    ).toBeVisible();
    await expect(container.getByText('Выберите начинку')).toBeHidden();
  });
});

test.describe('Взаимодействие с модальными окнами', () => {
  test.beforeEach(async ({ page }) => {
    await initIngredientsHar(page);
  });

  test('появление модального окна ингредиента по клику', async ({ page }) => {
    await page.goto('/');
    await page.getByText(TARGET_BUN).click();

    await expect(page).toHaveURL(new RegExp(`/ingredients/${TARGET_BUN_ID}$`));

    const modalDetails = findIngredientModal(page);
    await expect(modalDetails).toBeVisible();
    await expect(
      modalDetails.getByRole('heading', { name: 'Детали ингредиента' })
    ).toBeVisible();
    await expect(
      modalDetails.getByRole('heading', { name: TARGET_BUN })
    ).toBeVisible();

    const statsList = modalDetails.locator('ul');
    await expect(statsList.getByText('420', { exact: true })).toBeVisible();
    await expect(statsList.getByText('80', { exact: true })).toBeVisible();
    await expect(statsList.getByText('24', { exact: true })).toBeVisible();
    await expect(statsList.getByText('53', { exact: true })).toBeVisible();
  });

  test('кнопка-крестик закрывает модальное окно', async ({ page }) => {
    await page.goto('/');
    await page.getByText(TARGET_BUN).click();

    const modalDetails = findIngredientModal(page);
    await expect(modalDetails).toBeVisible();

    await modalDetails.locator('button svg').click();
    await expect(modalDetails).toBeHidden();
  });

  test('клик по оверлею закрывает модальное окно', async ({ page }) => {
    await page.goto('/');
    await page.getByText(TARGET_BUN).click();

    const modalDetails = findIngredientModal(page);
    await expect(modalDetails).toBeVisible();

    const bgOverlay = page.locator('#modals > div').last();
    await bgOverlay.click({ position: { x: 10, y: 10 } });

    await expect(modalDetails).toBeHidden();
  });
});
