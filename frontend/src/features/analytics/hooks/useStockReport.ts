import { useQuery } from '@tanstack/react-query';
import analyticsAPI from '../../../api/analytics';

export const useStockMovements = (period: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['analytics', 'stock', 'movements', period, startDate, endDate],
    queryFn: () => analyticsAPI.getStockMovements(period, startDate, endDate),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useStockLevels = (status: 'low' | 'zero' | 'overstocked' | 'all' | 'normal' = 'all') => {
  return useQuery({
    queryKey: ['analytics', 'stock', 'levels', status],
    queryFn: () => analyticsAPI.getStockLevels(status),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
