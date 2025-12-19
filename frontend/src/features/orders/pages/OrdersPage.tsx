import { Container, Title, Table, Badge, Button, Group, LoadingOverlay, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { OrderStatus } from '../../../types';

const statusColors: Record<string, string> = {
  [OrderStatus.NEW]: 'blue',
  [OrderStatus.ASSEMBLING]: 'yellow',
  [OrderStatus.TRANSFERRED]: 'orange',
  [OrderStatus.DELIVERED]: 'green',
};

export function OrdersPage() {
  const navigate = useNavigate();
  const { data: orders, isLoading, error } = useOrders();

  if (error) {
    return (
      <Container>
        <Text c="red">Ошибка загрузки заказов: {(error as Error).message}</Text>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Заказы</Title>
        <Button onClick={() => navigate('/orders/new')}>Создать заказ</Button>
      </Group>

      <div style={{ position: 'relative', minHeight: 200 }}>
        <LoadingOverlay visible={isLoading} />

        {orders && orders.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>№</Table.Th>
                <Table.Th>Дата</Table.Th>
                <Table.Th>Клиент</Table.Th>
                <Table.Th>Статус</Table.Th>
                <Table.Th>Позиций</Table.Th>
                <Table.Th>Действия</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {orders.map((order) => (
                <Table.Tr key={order.id}>
                  <Table.Td>{order.id}</Table.Td>
                  <Table.Td>{new Date(order.orderDate).toLocaleDateString('ru-RU')}</Table.Td>
                  <Table.Td>{order.customer.name}</Table.Td>
                  <Table.Td>
                    <Badge color={statusColors[order.status]}>{order.status}</Badge>
                  </Table.Td>
                  <Table.Td>{order.orderItems.length}</Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      Подробнее
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          !isLoading && <Text c="dimmed">Заказов пока нет</Text>
        )}
      </div>
    </Container>
  );
}
