import { useQuery } from '@tanstack/react-query';
import { customersAPI } from '../api';

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: customersAPI.getAll,
  });
};

export const useCustomer = (id: number) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customersAPI.getOne(id),
    enabled: !!id,
  });
};
