import { useQuery } from '@tanstack/react-query';
import analyticsAPI from '../../../api/analytics';

export const useTopCustomers = (period: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['analytics', 'customers', 'top', period, startDate, endDate],
    queryFn: () => analyticsAPI.getTopCustomers(period, startDate, endDate),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useDebtors = () => {
  return useQuery({
    queryKey: ['analytics', 'customers', 'debtors'],
    queryFn: () => analyticsAPI.getDebtors(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
