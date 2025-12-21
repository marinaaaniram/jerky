import { useQuery } from '@tanstack/react-query';
import analyticsAPI from '../../../api/analytics';

export const useOrderStatus = (period: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['analytics', 'orders', 'status', period, startDate, endDate],
    queryFn: () => analyticsAPI.getOrderStatus(period, startDate, endDate),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
