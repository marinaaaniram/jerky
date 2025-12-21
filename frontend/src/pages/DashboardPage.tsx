import { Container, Title, Text, SimpleGrid, Group, Button, Skeleton } from '@mantine/core';
import { IconRefresh, IconShoppingCart, IconUsers, IconPackage, IconCoin, IconAlertTriangle } from '@tabler/icons-react';
import { useAuthStore } from '../store/authStore';
import { useOrders } from '../features/orders/hooks/useOrders';
import { useCustomers } from '../hooks/useCustomers';
import { useProducts } from '../features/products/hooks/useProducts';
import { StatCard } from '../components/analytics/StatCard';
import { OrderStatusChart } from '../components/analytics/OrderStatusChart';
import { InventoryWidget } from '../components/analytics/InventoryWidget';
import {
  calculateTotalRevenue,
  calculateConsignmentDebt,
  calculateAverageOrderValue,
  formatCurrency,
} from '../utils/analytics';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: customers, isLoading: customersLoading } = useCustomers();
  const { data: products, isLoading: productsLoading } = useProducts();

  const isLoading = ordersLoading || customersLoading || productsLoading;

  // Calculate metrics
  const totalRevenue = calculateTotalRevenue(orders || []);
  const consignmentDebt = calculateConsignmentDebt(customers || []);
  const averageOrderValue = calculateAverageOrderValue(orders || []);
  const totalOrders = orders?.length || 0;
  const totalCustomers = customers?.length || 0;
  const totalProducts = products?.length || 0;

  return (
    <Container size="xl">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Панель управления</Title>
          <Text c="dimmed" size="sm" mt="xs">
            Добро пожаловать, {user?.firstName} {user?.lastName}! ({user?.role.name})
          </Text>
        </div>
        <Button
          variant="light"
          leftSection={<IconRefresh size={16} />}
          disabled={isLoading}
          onClick={() => window.location.reload()}
        >
          Обновить
        </Button>
      </Group>

      {/* General Statistics */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
        {isLoading ? (
          <>
            <Skeleton height={120} radius="md" />
            <Skeleton height={120} radius="md" />
            <Skeleton height={120} radius="md" />
            <Skeleton height={120} radius="md" />
          </>
        ) : (
          <>
            <StatCard
              icon={<IconShoppingCart size={24} />}
              label="Всего заказов"
              value={totalOrders}
              color="blue"
            />
            <StatCard
              icon={<IconUsers size={24} />}
              label="Всего клиентов"
              value={totalCustomers}
              color="cyan"
            />
            <StatCard
              icon={<IconPackage size={24} />}
              label="Товаров в каталоге"
              value={totalProducts}
              color="teal"
            />
            <StatCard
              icon={<IconCoin size={24} />}
              label="Общая выручка"
              value={formatCurrency(totalRevenue)}
              color="green"
            />
          </>
        )}
      </SimpleGrid>

      {/* Financial Indicators */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mb="xl">
        {isLoading ? (
          <>
            <Skeleton height={120} radius="md" />
            <Skeleton height={120} radius="md" />
            <Skeleton height={120} radius="md" />
          </>
        ) : (
          <>
            <StatCard
              icon={<IconAlertTriangle size={24} />}
              label="Долг (консигнация)"
              value={formatCurrency(consignmentDebt)}
              color="orange"
            />
            <StatCard
              icon={<IconCoin size={24} />}
              label="Средний чек"
              value={formatCurrency(averageOrderValue)}
              color="grape"
            />
            <StatCard
              icon={<IconPackage size={24} />}
              label="Активные заказы"
              value={orders?.filter((o) => o.status !== 'Доставлен').length || 0}
              color="indigo"
            />
          </>
        )}
      </SimpleGrid>

      {/* Charts and Widgets Row */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mb="xl">
        {/* Order Status Chart */}
        <OrderStatusChart orders={orders} isLoading={isLoading} />

        {/* Inventory Widget */}
        <InventoryWidget products={products} orders={orders} isLoading={isLoading} />
      </SimpleGrid>
    </Container>
  );
}
