import { Container, Title, Text, SimpleGrid, Stack, Tabs, Badge, Group, LoadingOverlay } from '@mantine/core';
import { IconTruck, IconListCheck, IconPackage } from '@tabler/icons-react';
import { useOrders } from '../../features/orders/hooks/useOrders';
import { useAuthStore } from '../../store/authStore';
import { OrderStatus } from '../../types';
import { DeliveryOrderCard } from './DeliveryOrderCard';
import { OrderStatusView } from './OrderStatusView';

export function DeliveryPanel() {
  const { data: orders, isLoading } = useOrders();
  const user = useAuthStore((state) => state.user);
  const isCourier = user?.role.name === 'Курьер';

  // Для курьера: заказы, которые нужно доставить
  // Показываем только заказы со статусом "Передан курьеру", назначенные на текущего курьера
  const courierOrders = orders?.filter(
    (order) => order.status === OrderStatus.TRANSFERRED && order.userId === user?.id
  ) || [];

  // Для остальных: все заказы, отсортированные по статусу
  const activeOrders = orders?.filter(
    (order) => order.status !== OrderStatus.DELIVERED
  ) || [];
  
  const deliveredOrders = orders?.filter(
    (order) => order.status === OrderStatus.DELIVERED
  ) || [];

  if (isCourier) {
    return (
      <Container size="xl">
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <div>
              <Title order={2}>Панель доставки</Title>
              <Text c="dimmed" size="sm" mt="xs">
                Заказы, которые нужно забрать и доставить
              </Text>
            </div>
            <Badge size="lg" color="orange" variant="light">
              {courierOrders.length} {courierOrders.length === 1 ? 'заказ' : 'заказов'}
            </Badge>
          </Group>

          <div style={{ position: 'relative', minHeight: 200 }}>
            <LoadingOverlay visible={isLoading} />
            
            {courierOrders.length > 0 ? (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {courierOrders.map((order) => (
                  <DeliveryOrderCard key={order.id} order={order} />
                ))}
              </SimpleGrid>
            ) : (
              <Stack align="center" gap="md" py="xl">
                <IconTruck size={64} color="var(--mantine-color-gray-4)" />
                <Text c="dimmed" size="lg">Нет заказов для доставки</Text>
                <Text c="dimmed" size="sm">
                  Когда заказы будут переданы курьеру, они появятся здесь
                </Text>
              </Stack>
            )}
          </div>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Stack gap="lg">
        <div>
          <Title order={2}>Панель доставки</Title>
          <Text c="dimmed" size="sm" mt="xs">
            Отслеживание статуса доставки заказов
          </Text>
        </div>

        <Tabs defaultValue="active">
          <Tabs.List>
            <Tabs.Tab value="active" leftSection={<IconPackage size={16} />}>
              Активные заказы
              {activeOrders.length > 0 && (
                <Badge size="sm" variant="filled" color="blue" ml="xs">
                  {activeOrders.length}
                </Badge>
              )}
            </Tabs.Tab>
            <Tabs.Tab value="delivered" leftSection={<IconListCheck size={16} />}>
              Доставленные
              {deliveredOrders.length > 0 && (
                <Badge size="sm" variant="filled" color="green" ml="xs">
                  {deliveredOrders.length}
                </Badge>
              )}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="active" pt="lg">
            <div style={{ position: 'relative', minHeight: 200 }}>
              <LoadingOverlay visible={isLoading} />
              
              {activeOrders.length > 0 ? (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                  {activeOrders.map((order) => (
                    <OrderStatusView key={order.id} order={order} />
                  ))}
                </SimpleGrid>
              ) : (
                <Stack align="center" gap="md" py="xl">
                  <IconPackage size={64} color="var(--mantine-color-gray-4)" />
                  <Text c="dimmed" size="lg">Нет активных заказов</Text>
                </Stack>
              )}
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="delivered" pt="lg">
            <div style={{ position: 'relative', minHeight: 200 }}>
              <LoadingOverlay visible={isLoading} />
              
              {deliveredOrders.length > 0 ? (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                  {deliveredOrders.map((order) => (
                    <OrderStatusView key={order.id} order={order} />
                  ))}
                </SimpleGrid>
              ) : (
                <Stack align="center" gap="md" py="xl">
                  <IconListCheck size={64} color="var(--mantine-color-gray-4)" />
                  <Text c="dimmed" size="lg">Нет доставленных заказов</Text>
                </Stack>
              )}
            </div>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}

