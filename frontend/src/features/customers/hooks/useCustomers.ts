import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersAPI } from '../../../api';
import { notifications } from '@mantine/notifications';

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

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; address?: string; phone?: string; paymentType: 'прямые' | 'реализация' }) =>
      customersAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      notifications.show({
        title: 'Успех',
        message: 'Клиент создан',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось создать клиента',
        color: 'red',
      });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; address?: string; phone?: string; paymentType?: 'прямые' | 'реализация' } }) =>
      customersAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      notifications.show({
        title: 'Успех',
        message: 'Клиент обновлен',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось обновить клиента',
        color: 'red',
      });
    },
  });
};

export const useArchiveCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customersAPI.archive,
    onSuccess: (_, customerId) => {
      queryClient.invalidateQueries({ queryKey: ['customers', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      notifications.show({
        title: 'Успех',
        message: 'Клиент архивирован',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось архивировать клиента',
        color: 'red',
      });
    },
  });
};
