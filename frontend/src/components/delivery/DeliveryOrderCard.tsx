import { Card, Stack, Text, Badge, Button, Group, Divider, Tooltip } from '@mantine/core';
import { IconMapPin, IconCheck, IconPackage } from '@tabler/icons-react';
import type { Order } from '../../types';
import { OrderStatus } from '../../types';
import { useUpdateOrderStatus } from '../../features/orders/hooks/useOrders';

interface DeliveryOrderCardProps {
  order: Order;
}

// Адрес склада (можно вынести в конфигурацию)
const WAREHOUSE_ADDRESS = 'Склад: ул. Складская, д. 1';

export function DeliveryOrderCard({ order }: DeliveryOrderCardProps) {
  const updateStatus = useUpdateOrderStatus();
  const customerAddress = order.customer.address || 'Адрес не указан';
  const orderDate = new Date(order.orderDate).toLocaleDateString('ru-RU');
  const itemsCount = order.orderItems.length;

  const handleDeliver = () => {
    updateStatus.mutate({ orderId: order.id, status: OrderStatus.DELIVERED });
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
      </Stack>
    </Card>
  );
}

