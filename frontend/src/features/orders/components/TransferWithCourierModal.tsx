import { Modal, Stack, Text, Select, Group, Button, Loader } from '@mantine/core';
import { useState } from 'react';
import type { Order } from '../../../types';
import { useAssignCourier, useUpdateOrderStatus } from '../hooks/useOrders';
import { useCouriers } from '../../../features/users/hooks/useUsers';
import { OrderStatus } from '../../../types';

interface TransferWithCourierModalProps {
  opened: boolean;
  onClose: () => void;
  order: Order;
  onSuccess?: () => void;
}

export function TransferWithCourierModal({
  opened,
  onClose,
  order,
  onSuccess,
}: TransferWithCourierModalProps) {
  const [selectedCourierId, setSelectedCourierId] = useState<string | null>(
    order.userId?.toString() || null
  );
  const [isLoading, setIsLoading] = useState(false);

  const { data: couriers } = useCouriers();
  const assignCourier = useAssignCourier();
  const updateStatus = useUpdateOrderStatus();

  const courierOptions =
    couriers?.map((courier) => ({
      value: courier.id.toString(),
      label: `${courier.firstName} ${courier.lastName}`,
    })) || [];

  const handleSubmit = async () => {
    if (!selectedCourierId) return;

    setIsLoading(true);
    try {
      // First assign courier
      await assignCourier.mutateAsync({
        orderId: order.id,
        userId: Number(selectedCourierId),
      });

      // Then update status to TRANSFERRED
      await updateStatus.mutateAsync({
        orderId: order.id,
        status: OrderStatus.TRANSFERRED,
      });

      onClose();
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = !selectedCourierId || isLoading;

  return (
    <Modal opened={opened} onClose={onClose} title="Передать заказ курьеру" centered>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Выберите курьера для передачи заказа №{order.id}
        </Text>

        <Select
          label="Курьер"
          placeholder="Выберите курьера"
          data={courierOptions}
          value={selectedCourierId}
          onChange={setSelectedCourierId}
          searchable
          disabled={isLoading}
          required
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            leftSection={isLoading ? <Loader size={16} /> : undefined}
          >
            Назначить и передать
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
