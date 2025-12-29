import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersAPI } from '../../../api';
import { notifications } from '@mantine/notifications';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: ordersAPI.getAll,
  });
};

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersAPI.getOne(id),
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      notifications.show({
        title: 'Успех',
        message: 'Заказ создан',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось создать заказ',
        color: 'red',
      });
    },
  });
};

export const useAddOrderItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemData }: { orderId: number; itemData: { productId: number; quantity: number } }) =>
      ordersAPI.addItem(orderId, itemData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      notifications.show({
        title: 'Успех',
        message: 'Товар добавлен в заказ',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось добавить товар',
        color: 'red',
      });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      ordersAPI.updateStatus(orderId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      notifications.show({
        title: 'Успех',
        message: 'Статус заказа обновлен',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось обновить статус',
        color: 'red',
      });
    },
  });
};

export const useOrderTotal = (orderId: number) => {
  return useQuery({
    queryKey: ['orders', orderId, 'total'],
    queryFn: () => ordersAPI.getTotal(orderId),
    enabled: !!orderId,
  });
};

export const useAssignCourier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, userId }: { orderId: number; userId: number }) =>
      ordersAPI.assignCourier(orderId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      notifications.show({
        title: 'Успех',
        message: 'Курьер назначен на заказ',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось назначить курьера',
        color: 'red',
      });
    },
  });
};
