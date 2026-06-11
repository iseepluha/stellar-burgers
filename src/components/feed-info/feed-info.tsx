import { FC } from 'react';

import { TOrder } from '@utils-types';
import { FeedInfoUI } from '@ui';
import { useSelector } from '../../services/store';
import {
  selectFeedOrders,
  selectTotal,
  selectTotalToday
} from '../../services/slices/feedSlice';

const getOrders = (orders: TOrder[], status: string): number[] =>
  orders
    .filter((item) => item.status === status)
    .map((item) => item.number)
    .slice(0, 20);

export const FeedInfo: FC = () => {
  const orders: TOrder[] = useSelector(selectFeedOrders);
  const total = useSelector(selectTotal);
  const totalToday = useSelector(selectTotalToday);

  const feed = { total, totalToday };

  const readyOrders = getOrders(orders, 'done');

  const pendingOrders = getOrders(orders, 'pending');

  return (
    <FeedInfoUI
      readyOrders={readyOrders}
      pendingOrders={pendingOrders}
      feed={feed}
    />
  );
};
