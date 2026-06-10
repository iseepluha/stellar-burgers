import { ProfileOrdersUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import {
  getProfileOrders,
  selectProfileOrders,
  selectProfileOrdersIsLoading
} from '../../services/slices/profileOrdersSlice';
import { Preloader } from '@ui';

export const ProfileOrders: FC = () => {
  /** TODO: взять переменную из стора */
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getProfileOrders());
  }, [dispatch]);
  const orders: TOrder[] = useSelector(selectProfileOrders);
  const isLoading = useSelector(selectProfileOrdersIsLoading);
  if (isLoading) {
    return <Preloader />;
  }

  return <ProfileOrdersUI orders={orders} />;
};
