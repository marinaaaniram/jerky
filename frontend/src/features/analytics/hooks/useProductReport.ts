import { useQuery } from '@tanstack/react-query';
import analyticsAPI from '../../../api/analytics';

export const useTopProducts = (
  period: string,
  startDate?: string,
  endDate?: string,
  sortBy: 'quantity' | 'revenue' = 'quantity'
) => {
  return useQuery({
    queryKey: ['analytics', 'products', 'top', period, startDate, endDate, sortBy],
    queryFn: () => analyticsAPI.getTopProducts(period, startDate, endDate, sortBy),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
