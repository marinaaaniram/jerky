import { Container, Title, Text, SimpleGrid, Stack, LoadingOverlay, Group, Badge } from '@mantine/core';
import { IconTruck } from '@tabler/icons-react';
import { useOrders } from '../../features/orders/hooks/useOrders';
import { useAuthStore } from '../../store/authStore';
import { OrderStatus } from '../../types';
import { DeliveryOrderCard } from './DeliveryOrderCard';

export function DeliveryPanel() {
  const { data: orders, isLoading } = useOrders();
  const user = useAuthStore((state) => state.user);
  const isCourier = user?.role.name === 'Курьер';

  // Для курьера: заказы, которые нужно доставить
  // Показываем только заказы со статусом "Передан курьеру", назначенные на текущего курьера
  const courierOrders = orders?.filter(
    (order) => order.status === OrderStatus.TRANSFERRED && order.userId === user?.id
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
      <Stack gap="lg" align="center" justify="center" py="xl" style={{ minHeight: '60vh' }}>
        <IconTruck size={80} color="var(--mantine-color-gray-4)" style={{ opacity: 0.5 }} />
        <Stack align="center" gap="xs">
          <Title order={2}>Панель доставки</Title>
          <Text c="dimmed" size="lg">
            Добро пожаловать в систему управления доставкой
          </Text>
          <Text c="dimmed" size="sm">
            Панель доставки предназначена для курьеров. Используйте раздел "Заказы" для управления заказами.
          </Text>
        </Stack>
      </Stack>
    </Container>
  );
}

