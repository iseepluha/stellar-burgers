import { FC } from 'react';
import { Preloader } from '@ui';
import { IngredientDetailsUI } from '@ui';
import { useSelector } from '../../services/store';
import { useParams } from 'react-router-dom';
import { selectIngredients } from '../../services/slices/ingredientsSlice';

export const IngredientDetails: FC = () => {
  const { id } = useParams();

  const ingredients = useSelector(selectIngredients);
  const ingredientData = ingredients.find(({ _id }) => _id === id);

  if (!ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
