import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryAPI } from '../../../api/inventory';
import type { AdjustStockPayload } from '../../../api/inventory';
import { notifications } from '@mantine/notifications';

export const useStockAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, payload }: { productId: number; payload: AdjustStockPayload }) =>
      inventoryAPI.adjustStock(productId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history', data.productId] });
      notifications.show({
        title: 'Успех',
        message: 'Остаток товара обновлен',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось обновить остаток',
        color: 'red',
      });
    },
  });
};
