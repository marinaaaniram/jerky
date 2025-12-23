import { Card, Stack, Text, Badge, ActionIcon, Menu, rem, Flex, Tooltip } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import type { Order } from '../../../types';

interface OrderCardProps {
  order: Order;
  statusColors: Record<string, string>;
  onView: (id: number) => void;
}

export function OrderCard({ order, statusColors, onView }: OrderCardProps) {
  const orderDate = new Date(order.orderDate).toLocaleDateString('ru-RU');
  const statusColor = statusColors[order.status] || 'gray';

  return (
    <Card withBorder padding="md" radius="md">
      <Flex justify="space-between" align="flex-start" mb="sm">
        <Stack gap={0} flex={1}>
          <Badge size="sm" color={statusColor} w="fit-content">{order.status}</Badge>
          <Text fw={600} size="lg" mt={8}>{order.customer.name}</Text>
        </Stack>

        <Menu position="bottom-end" shadow="md">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="sm">
              <IconDots style={{ width: rem(16), height: rem(16) }} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item onClick={() => onView(order.id)}>Подробнее</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Flex>

      <Stack gap="xs">
        <Flex justify="space-between" align="center">
          <Text size="sm" c="dimmed">Дата</Text>
          <Text size="sm" fw={500}>{orderDate}</Text>
        </Flex>

        <Flex justify="space-between" align="center">
          <Text size="sm" c="dimmed">Позиций</Text>
          <Badge size="sm" variant="light">{order.orderItems.length}</Badge>
        </Flex>

        {order.notes && (
          <Flex justify="space-between" align="flex-start">
            <Text size="sm" c="dimmed">Примечания</Text>
            <Tooltip label={order.notes} multiline maw={200}>
              <Text size="sm" fw={500} lineClamp={1} style={{ cursor: 'help', maxWidth: '150px' }}>
                📝 {order.notes}
              </Text>
            </Tooltip>
          </Flex>
        )}
      </Stack>
    </Card>
  );
}
