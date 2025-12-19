import { useQuery } from '@tanstack/react-query';
import { productsAPI } from '../../../api';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.getAll,
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsAPI.getOne(id),
    enabled: !!id,
  });
};
