import { Card, Stack, Text, Badge, Flex, Tooltip } from '@mantine/core';
import type { Order } from '../../../types';

interface KanbanOrderCardProps {
  order: Order;
  onView: (id: number) => void;
}

export function KanbanOrderCard({ order, onView }: KanbanOrderCardProps) {
  const orderDate = new Date(order.orderDate).toLocaleDateString('ru-RU');
  const total = order.orderItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(order.id);
  };

  return (
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
      </Stack>
    </Card>
    </Tooltip>
  );
}

