import { useSelector } from '../../services/store';

import styles from './constructor-page.module.css';

import { BurgerIngredients } from '@components';
import { BurgerConstructor } from '@components';
import { Preloader } from '@ui';
import { FC } from 'react';
import {
  selectIngredients,
  selectIngredientsError,
  selectIsIngredientsLoading
} from '../../services/slices/ingredientsSlice';

export const ConstructorPage: FC = () => {
  const isIngredientsLoading = useSelector(selectIsIngredientsLoading);
  const ingredients = useSelector(selectIngredients);
  const error = useSelector(selectIngredientsError);

  return isIngredientsLoading ? (
    <Preloader />
  ) : error ? (
    <div className={`${styles.error} text text_type_main-medium pt-4`}>
      {error}
    </div>
  ) : ingredients.length > 0 ? (
    <main className={styles.containerMain}>
      <h1
        className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}
      >
        Соберите бургер
      </h1>
      <div className={`${styles.main} pl-5 pr-5`}>
        <BurgerIngredients />
        <BurgerConstructor />
      </div>
    </main>
  ) : (
    <div className={`${styles.title} text text_type_main-medium pt-4`}>
      Нет игредиентов
    </div>
  );
};
