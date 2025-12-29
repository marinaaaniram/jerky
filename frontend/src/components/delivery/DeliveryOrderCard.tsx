import { useState } from 'react';
import { Card, Stack, Text, Badge, Button, Group, Divider, Tooltip } from '@mantine/core';
import { IconMapPin, IconCheck, IconPackage } from '@tabler/icons-react';
import type { Order } from '../../types';
import { OrderStatus } from '../../types';
import { useUpdateOrderStatus } from '../../features/orders/hooks/useOrders';
import { useAuthStore } from '../../store/authStore';
import { notifications } from '@mantine/notifications';
import { DeliverySurveyModal } from '../../features/orders/components/DeliverySurveyModal';

interface DeliveryOrderCardProps {
  order: Order;
}

// Адрес склада (можно вынести в конфигурацию)
const WAREHOUSE_ADDRESS = 'Склад: ул. Складская, д. 1';

export function DeliveryOrderCard({ order }: DeliveryOrderCardProps) {
  const updateStatus = useUpdateOrderStatus();
  const { user } = useAuthStore();
  const [surveyModalOpened, setSurveyModalOpened] = useState(false);
  const customerAddress = order.customer.address || 'Адрес не указан';
  const orderDate = new Date(order.orderDate).toLocaleDateString('ru-RU');
  const itemsCount = order.orderItems.length;

  const isTransferred = order.status === OrderStatus.TRANSFERRED;
  const isAssignedToCurrentUser = order.userId === user?.id;
  const canMarkDelivered = isTransferred && isAssignedToCurrentUser;

  const handleDeliver = () => {
    // Check if order is in TRANSFERRED status
    if (!isTransferred) {
      notifications.show({
        title: 'Ошибка',
        message: 'Заказ должен быть в статусе "Передан курьеру"',
        color: 'red',
      });
      return;
    }

    // Check if current user is the assigned courier
    if (!isAssignedToCurrentUser) {
      notifications.show({
        title: 'Ошибка',
        message: 'Вы не являетесь назначенным курьером на этот заказ',
        color: 'red',
      });
      return;
    }

    // If delivery survey is required, show modal
    if (!order.deliverySurvey) {
      setSurveyModalOpened(true);
      return;
    }

    updateStatus.mutate({ orderId: order.id, status: OrderStatus.DELIVERED });
  };

  const handleSurveySubmitted = () => {
    // After survey is submitted, update status to DELIVERED
    updateStatus.mutate({ orderId: order.id, status: OrderStatus.DELIVERED });
    setSurveyModalOpened(false);
  };

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="md">
        {/* Заголовок заказа */}
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Badge color="orange" size="lg">Заказ #{order.id}</Badge>
            <Text fw={600} size="lg">{order.customer.name}</Text>
            <Text size="sm" c="dimmed">Дата: {orderDate}</Text>
          </Stack>
          <Badge color="blue" variant="light">
            {itemsCount} {itemsCount === 1 ? 'позиция' : itemsCount < 5 ? 'позиции' : 'позиций'}
          </Badge>
        </Group>

        <Divider />

        {/* Откуда забрать */}
        <Stack gap="xs">
          <Group gap="xs">
            <IconPackage size={20} color="var(--mantine-color-blue-6)" />
            <Text fw={500} size="sm" c="blue">Забрать откуда:</Text>
          </Group>
          <Text size="sm" ml={28} c="dimmed">{WAREHOUSE_ADDRESS}</Text>
        </Stack>

        {/* Куда доставить */}
        <Stack gap="xs">
          <Group gap="xs">
            <IconMapPin size={20} color="var(--mantine-color-green-6)" />
            <Text fw={500} size="sm" c="green">Доставить куда:</Text>
          </Group>
          <Text size="sm" ml={28}>{customerAddress}</Text>
          {order.customer.phone && (
            <Text size="xs" ml={28} c="dimmed">📞 {order.customer.phone}</Text>
          )}
        </Stack>

        {/* Информация о заказе */}
        {order.notes && (
          <Tooltip label={order.notes} multiline maw={300}>
            <Text size="sm" c="dimmed" style={{ cursor: 'help' }}>
              📝 {order.notes}
            </Text>
          </Tooltip>
        )}

        <Divider />

        {/* Действия */}
        {canMarkDelivered && (
          <Button
            variant="filled"
            color="green"
            fullWidth
            leftSection={<IconCheck size={18} />}
            onClick={handleDeliver}
            disabled={order.status === OrderStatus.DELIVERED}
            loading={updateStatus.isPending}
            size="md"
          >
            {order.status === OrderStatus.DELIVERED ? 'Доставлен' : 'Отметить как доставленный'}
          </Button>
        )}
        
        {!canMarkDelivered && order.status === OrderStatus.TRANSFERRED && (
          <Text size="sm" c="dimmed" ta="center">
            Заказ назначен другому курьеру
          </Text>
        )}
      </Stack>

      <DeliverySurveyModal
        opened={surveyModalOpened}
        onClose={() => setSurveyModalOpened(false)}
        orderId={order.id}
        onSuccess={handleSurveySubmitted}
      />
    </Card>
  );
}

