import { Card, Stack, Text, Badge, Group, Progress, Divider } from '@mantine/core';
import { IconMapPin, IconUser, IconPackage, IconTruck, IconCheck } from '@tabler/icons-react';
import type { Order } from '../../types';
import { OrderStatus } from '../../types';

interface OrderStatusViewProps {
  order: Order;
}

const statusSteps = [
  { status: OrderStatus.NEW, label: 'Новый', icon: IconPackage, color: 'gray' },
  { status: OrderStatus.ASSEMBLING, label: 'В сборке', icon: IconPackage, color: 'yellow' },
  { status: OrderStatus.TRANSFERRED, label: 'Передан курьеру', icon: IconTruck, color: 'orange' },
  { status: OrderStatus.DELIVERED, label: 'Доставлен', icon: IconCheck, color: 'green' },
];

export function OrderStatusView({ order }: OrderStatusViewProps) {
  const orderDate = new Date(order.orderDate).toLocaleDateString('ru-RU');
  const currentStatusIndex = statusSteps.findIndex(step => step.status === order.status);
  const progress = ((currentStatusIndex + 1) / statusSteps.length) * 100;

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      [OrderStatus.NEW]: 'gray',
      [OrderStatus.ASSEMBLING]: 'yellow',
      [OrderStatus.TRANSFERRED]: 'orange',
      [OrderStatus.DELIVERED]: 'green',
    };
    return statusMap[status] || 'gray';
  };

  return (
    <Card withBorder padding="lg" radius="md" shadow="sm">
      <Stack gap="md">
        {/* Заголовок */}
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text fw={600} size="lg">Заказ #{order.id}</Text>
            <Text size="sm" c="dimmed">{order.customer.name}</Text>
            <Text size="xs" c="dimmed">Дата: {orderDate}</Text>
          </Stack>
          <Badge color={getStatusColor(order.status)} size="lg">
            {order.status}
          </Badge>
        </Group>

        <Divider />

        {/* Прогресс доставки */}
        <Stack gap="xs">
          <Text size="sm" fw={500}>Статус доставки</Text>
          <Progress value={progress} color={getStatusColor(order.status)} size="lg" radius="xl" />
          <Group gap="xs" mt="xs">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <Group key={step.status} gap={4} style={{ flex: 1 }}>
                  <Icon 
                    size={16} 
                    color={isActive ? `var(--mantine-color-${step.color}-6)` : 'var(--mantine-color-gray-4)'}
                    style={{ opacity: isActive ? 1 : 0.5 }}
                  />
                  <Text 
                    size="xs" 
                    c={isActive ? step.color : 'dimmed'}
                    fw={isCurrent ? 600 : 400}
                    style={{ opacity: isActive ? 1 : 0.6 }}
                  >
                    {step.label}
                  </Text>
                </Group>
              );
            })}
          </Group>
        </Stack>

        <Divider />

        {/* Информация о курьере */}
        {order.user && (
          <Group gap="xs">
            <IconUser size={18} color="var(--mantine-color-blue-6)" />
            <Text size="sm">
              <Text span fw={500}>Курьер: </Text>
              {order.user.firstName} {order.user.lastName}
            </Text>
          </Group>
        )}

        {/* Адрес доставки */}
        {order.customer.address && (
          <Group gap="xs" align="flex-start">
            <IconMapPin size={18} color="var(--mantine-color-green-6)" />
            <Text size="sm" style={{ flex: 1 }}>
              <Text span fw={500}>Адрес доставки: </Text>
              {order.customer.address}
            </Text>
          </Group>
        )}

        {/* Примечания */}
        {order.notes && (
          <>
            <Divider />
            <Text size="sm" c="dimmed">
              <Text span fw={500}>Примечания: </Text>
              {order.notes}
            </Text>
          </>
        )}

        {/* Информация о товарах */}
        <Divider />
        <Text size="sm">
          <Text span fw={500}>Товаров в заказе: </Text>
          {order.orderItems.length} {order.orderItems.length === 1 ? 'позиция' : 'позиций'}
        </Text>
      </Stack>
    </Card>
  );
}

