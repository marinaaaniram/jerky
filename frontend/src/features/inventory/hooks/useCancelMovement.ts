import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryAPI } from '../../../api/inventory';
import type { CancelMovementPayload } from '../../../api/inventory';
import { notifications } from '@mantine/notifications';

export const useCancelMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ movementId, payload }: { movementId: number; payload: CancelMovementPayload }) =>
      inventoryAPI.cancelMovement(movementId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
      notifications.show({
        title: 'Успех',
        message: 'Операция отменена',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось отменить операцию',
        color: 'red',
      });
    },
  });
};
