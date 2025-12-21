import { useQuery } from '@tanstack/react-query';
import analyticsAPI from '../../../api/analytics';

export const useSalesReport = (period: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['analytics', 'sales', period, startDate, endDate],
    queryFn: () => analyticsAPI.getSalesReport(period, startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
