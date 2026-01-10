import {
  Container,
  Title,
  Table,
  Badge,
  Button,
  Group,
  LoadingOverlay,
  Text,
  Tooltip,
  SimpleGrid,
  Tabs,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { useOrders, useUpdateOrderStatus } from '../hooks/useOrders';
import { OrderStatus } from '../../../types';
import { TableActionMenu } from '../../../components/TableActionMenu';
import { OrderCard } from '../components/OrderCard';
import { KanbanBoard } from '../components/KanbanBoard';
import { useAuthStore } from '../../../store/authStore';

const statusColors: Record<string, string> = {
  [OrderStatus.NEW]: 'gray',
  [OrderStatus.ASSEMBLING]: 'yellow',
  [OrderStatus.TRANSFERRED]: 'orange',
  [OrderStatus.DELIVERED]: 'green',
};

export function OrdersPage() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { data: orders, isLoading, error } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();
  const isCourier = useAuthStore((state) => state.isCourier());

  if (error) {
    return (
      <Container>
        <Text c="red">Ошибка загрузки заказов: {(error as Error).message}</Text>
      </Container>
    );
  }

  // Для курьеров - показываем обычный список (как было)
  if (isCourier) {
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const filteredOrders = selectedStatus
      ? orders?.filter((order) => order.status === selectedStatus)
      : orders;

    const statuses = [
      OrderStatus.NEW,
      OrderStatus.ASSEMBLING,
      OrderStatus.TRANSFERRED,
      OrderStatus.DELIVERED,
    ];

    return (
      <Container size="xl">
        <Group justify="space-between" mb="xl">
          <Title order={2}>Заказы</Title>
        </Group>

        <Group mb="lg">
          <Button
            variant={selectedStatus === null ? 'filled' : 'light'}
            onClick={() => setSelectedStatus(null)}
          >
            Все
          </Button>
          {statuses.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? 'filled' : 'light'}
              color={statusColors[status]}
              onClick={() => setSelectedStatus(status)}
            >
              {status}
            </Button>
          ))}
        </Group>

        <div style={{ position: 'relative', minHeight: 200 }}>
          <LoadingOverlay visible={isLoading} />

          {filteredOrders && filteredOrders.length > 0 ? (
            isMobile ? (
              <SimpleGrid cols={1} spacing="md">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    statusColors={statusColors}
                    onView={(id) => navigate(`/orders/${id}`)}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Дата</Table.Th>
                    <Table.Th>Клиент</Table.Th>
                    <Table.Th>Статус</Table.Th>
                    <Table.Th>Позиций</Table.Th>
                    <Table.Th>Примечания</Table.Th>
                    <Table.Th>Действия</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredOrders.map((order) => (
                    <Table.Tr key={order.id}>
                      <Table.Td>{new Date(order.orderDate).toLocaleDateString('ru-RU')}</Table.Td>
                      <Table.Td>{order.customer.name}</Table.Td>
                      <Table.Td>
                        <Badge color={statusColors[order.status]}>{order.status}</Badge>
                      </Table.Td>
                      <Table.Td>{order.orderItems.length}</Table.Td>
                      <Table.Td>
                        {order.notes ? (
                          <Tooltip label={order.notes} multiline maw={300}>
                            <Text size="sm" c="dimmed" lineClamp={1} style={{ cursor: 'help' }}>
                              📝 {order.notes}
                            </Text>
                          </Tooltip>
                        ) : (
                          <Text size="sm" c="dimmed">—</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <TableActionMenu
                          actions={[
                            {
                              label: 'Подробнее',
                              onClick: () => navigate(`/orders/${order.id}`),
                            },
                          ]}
                        />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )
          ) : (
            !isLoading && <Text c="dimmed">Заказов пока нет</Text>
          )}
        </div>
      </Container>
    );
  }

  // Для не-курьеров - показываем kanban доску с вкладками
  const activeOrders = orders?.filter(
    (order) =>
      order.status === OrderStatus.NEW ||
      order.status === OrderStatus.ASSEMBLING ||
      order.status === OrderStatus.TRANSFERRED
  ) || [];
  const deliveredOrders = orders?.filter((order) => order.status === OrderStatus.DELIVERED) || [];

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    await updateStatusMutation.mutateAsync({ orderId, status: newStatus });
  };

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Заказы</Title>
        <Button onClick={() => navigate('/orders/new')}>Создать заказ</Button>
      </Group>

      <Tabs defaultValue="active">
        <Tabs.List>
          <Tabs.Tab value="active">
            Активные
            {activeOrders.length > 0 && (
              <Badge size="sm" variant="filled" color="blue" ml="xs">
                {activeOrders.length}
              </Badge>
            )}
          </Tabs.Tab>
          <Tabs.Tab value="delivered">
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
              <KanbanBoard
                orders={activeOrders}
                onView={(id) => navigate(`/orders/${id}`)}
                onStatusChange={handleStatusChange}
              />
            ) : (
              !isLoading && <Text c="dimmed">Нет активных заказов</Text>
            )}
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="delivered" pt="lg">
          <div style={{ position: 'relative', minHeight: 200 }}>
            <LoadingOverlay visible={isLoading} />
            {deliveredOrders.length > 0 ? (
              isMobile ? (
                <SimpleGrid cols={1} spacing="md">
                  {deliveredOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      statusColors={statusColors}
                      onView={(id) => navigate(`/orders/${id}`)}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Дата</Table.Th>
                      <Table.Th>Клиент</Table.Th>
                      <Table.Th>Позиций</Table.Th>
                      <Table.Th>Примечания</Table.Th>
                      <Table.Th>Действия</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {deliveredOrders.map((order) => (
                      <Table.Tr key={order.id}>
                        <Table.Td>{new Date(order.orderDate).toLocaleDateString('ru-RU')}</Table.Td>
                        <Table.Td>{order.customer.name}</Table.Td>
                        <Table.Td>{order.orderItems.length}</Table.Td>
                        <Table.Td>
                          {order.notes ? (
                            <Tooltip label={order.notes} multiline maw={300}>
                              <Text size="sm" c="dimmed" lineClamp={1} style={{ cursor: 'help' }}>
                                📝 {order.notes}
                              </Text>
                            </Tooltip>
                          ) : (
                            <Text size="sm" c="dimmed">—</Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <TableActionMenu
                            actions={[
                              {
                                label: 'Подробнее',
                                onClick: () => navigate(`/orders/${order.id}`),
                              },
                            ]}
                          />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )
            ) : (
              !isLoading && <Text c="dimmed">Нет доставленных заказов</Text>
            )}
          </div>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
