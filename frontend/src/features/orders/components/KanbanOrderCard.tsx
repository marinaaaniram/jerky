import { Card, Stack, Text, Badge, Flex, Tooltip, Button, Group, Modal, Alert } from '@mantine/core';
import { IconArrowRight, IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';
import type { Order } from '../../../types';
import { OrderStatus } from '../../../types';
import { TransferWithCourierModal } from './TransferWithCourierModal';

interface KanbanOrderCardProps {
  order: Order;
  onView: (id: number) => void;
  onStatusChange?: (orderId: number, newStatus: OrderStatus) => void;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.NEW]: 'Новый',
  [OrderStatus.ASSEMBLING]: 'В сборке',
  [OrderStatus.TRANSFERRED]: 'Передан курьеру',
  [OrderStatus.DELIVERED]: 'Доставлен',
};

export function KanbanOrderCard({ order, onView, onStatusChange }: KanbanOrderCardProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const orderDate = new Date(order.orderDate).toLocaleDateString('ru-RU');
  const total = order.orderItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(order.id);
  };

  const getNextStatus = (): OrderStatus | null => {
    switch (order.status) {
      case OrderStatus.NEW:
        return OrderStatus.ASSEMBLING;
      case OrderStatus.ASSEMBLING:
        return OrderStatus.TRANSFERRED;
      case OrderStatus.TRANSFERRED:
        return null;
      default:
        return null;
    }
  };

  const handleMoveNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = getNextStatus();
    if (nextStatus) {
      // If moving to TRANSFERRED, open courier selection modal instead of confirmation
      if (nextStatus === OrderStatus.TRANSFERRED) {
        setIsTransferModalOpen(true);
      } else {
        setPendingStatus(nextStatus);
        setIsConfirmOpen(true);
      }
    }
  };

  const handleConfirm = () => {
    if (pendingStatus && onStatusChange) {
      onStatusChange(order.id, pendingStatus);
    }
    setIsConfirmOpen(false);
    setPendingStatus(null);
  };

  const handleCancel = () => {
    setIsConfirmOpen(false);
    setPendingStatus(null);
  };

  const nextStatus = getNextStatus();

  return (
    <>
      <Tooltip label="Двойной клик для просмотра деталей" position="top">
        <Card
          withBorder
          padding="md"
          radius="md"
          style={{ cursor: 'grab' }}
          onDoubleClick={handleDoubleClick}
          shadow="sm"
          h="100%"
        >
          <Stack gap="xs">
            <Flex justify="space-between" align="flex-start">
              <Text fw={600} size="sm">
                Заказ №{order.id}
              </Text>
              <Badge size="sm" variant="light">
                {order.orderItems.length} шт.
              </Badge>
            </Flex>

            <Text fw={500} size="md" lineClamp={1}>
              {order.customer.name}
            </Text>

            <Text size="xs" c="dimmed">
              {orderDate}
            </Text>

            <Text size="sm" fw={600} c="blue">
              {total.toFixed(2)} ₽
            </Text>

            {order.notes && (
              <Tooltip label={order.notes} multiline maw={250}>
                <Text size="xs" c="dimmed" lineClamp={2} style={{ cursor: 'help' }}>
                  📝 {order.notes}
                </Text>
              </Tooltip>
            )}

            {order.user && (
              <Text size="xs" c="dimmed">
                Курьер: {order.user.firstName} {order.user.lastName}
              </Text>
            )}

            {order.status === OrderStatus.TRANSFERRED && (
              <Alert icon={<IconInfoCircle size={16} />} color="orange" title="Статус в работе у курьера">
                <Text size="xs">
                  Дальнейшие изменения статуса происходят у курьера до момента доставления заказа.
                </Text>
              </Alert>
            )}

            {nextStatus && onStatusChange && (
              <Group grow pt="xs">
                <Button
                  size="xs"
                  variant="light"
                  rightSection={<IconArrowRight size={14} />}
                  onClick={handleMoveNextClick}
                >
                  Далее
                </Button>
              </Group>
            )}
          </Stack>
        </Card>
      </Tooltip>

      <Modal
        opened={isConfirmOpen}
        onClose={handleCancel}
        title="Подтверждение"
        centered
      >
        <Stack gap="md">
          <Text>
            Вы уверены, что хотите перевести заказ <strong>№{order.id}</strong> в статус{' '}
            <strong>{pendingStatus && STATUS_LABELS[pendingStatus]}</strong>?
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={handleCancel}>
              Отмена
            </Button>
            <Button onClick={handleConfirm} color="blue">
              Подтвердить
            </Button>
          </Group>
        </Stack>
      </Modal>

      <TransferWithCourierModal
        opened={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        order={order}
        onSuccess={() => {
          setIsTransferModalOpen(false);
          // The mutations in TransferWithCourierModal will refresh the data
        }}
      />
    </>
  );
}

