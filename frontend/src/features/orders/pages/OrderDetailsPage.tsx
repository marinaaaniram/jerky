import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Card,
  Text,
  Badge,
  Button,
  Group,
  Stack,
  LoadingOverlay,
  Select,
  Grid,
} from '@mantine/core';
import { IconArrowLeft, IconFileText } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useOrder, useUpdateOrderStatus, useOrderTotal } from '../hooks/useOrders';
import { useAuthStore } from '../../../store/authStore';
import { OrderStatus } from '../../../types';
import { OrderItemsTable } from '../components/OrderItemsTable';
import { AddItemModal } from '../components/AddItemModal';
import { DeliverySurveyModal } from '../components/DeliverySurveyModal';

const statusColors: Record<string, string> = {
  [OrderStatus.NEW]: 'gray',
  [OrderStatus.ASSEMBLING]: 'yellow',
  [OrderStatus.TRANSFERRED]: 'orange',
  [OrderStatus.DELIVERED]: 'green',
};

const statusOptions = [
  { value: OrderStatus.NEW, label: OrderStatus.NEW },
  { value: OrderStatus.ASSEMBLING, label: OrderStatus.ASSEMBLING },
  { value: OrderStatus.TRANSFERRED, label: OrderStatus.TRANSFERRED },
  { value: OrderStatus.DELIVERED, label: OrderStatus.DELIVERED },
];

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = Number(id);

  const { data: order, isLoading, error } = useOrder(orderId);
  const { data: totalData } = useOrderTotal(orderId);
  const updateStatus = useUpdateOrderStatus();
  const { canChangeStatus } = useAuthStore();

  const [addItemModalOpened, setAddItemModalOpened] = useState(false);
  const [surveyModalOpened, setSurveyModalOpened] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  if (error) {
    return (
      <Container>
        <Text c="red">Ошибка загрузки заказа: {(error as Error).message}</Text>
        <Button onClick={() => navigate('/orders')} mt="md" leftSection={<IconArrowLeft size={18} />}>
          Назад к списку
        </Button>
      </Container>
    );
  }

  if (isLoading || !order) {
    return (
      <Container>
        <LoadingOverlay visible />
      </Container>
    );
  }

  const isDelivered = order.status === OrderStatus.DELIVERED;
  const canEdit = !isDelivered;
  const hasItems = order.orderItems && order.orderItems.length > 0;

  const handleStatusChange = (newStatus: string | null) => {
    if (!newStatus) return;

    // Check if order has items
    if (!hasItems) {
      notifications.show({
        title: 'Ошибка',
        message: 'Добавьте хотя бы одну позицию перед изменением статуса',
        color: 'red',
      });
      return;
    }

    // If changing to DELIVERED, require delivery survey
    if (newStatus === OrderStatus.DELIVERED && !order.deliverySurvey) {
      setSurveyModalOpened(true);
      setSelectedStatus(newStatus);
      return;
    }

    updateStatus.mutate({ orderId, status: newStatus });
  };

  const handleSurveySubmitted = () => {
    // After survey is submitted, update status to DELIVERED
    if (selectedStatus === OrderStatus.DELIVERED) {
      updateStatus.mutate({ orderId, status: selectedStatus });
    }
    setSurveyModalOpened(false);
    setSelectedStatus(null);
  };

  return (
    <Container size="xl">
      <Group justify="flex-start" mb="xl" gap="xs">
        <Button variant="subtle" onClick={() => navigate('/orders')} leftSection={<IconArrowLeft size={18} />}>
          Назад к списку
        </Button>
        <Title order={2} style={{ flexGrow: 1 }}>Заказ №{order.id}</Title>
      </Group>

      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Stack gap="md" style={{ flex: 1 }}>
              <div>
                <Text size="sm" c="dimmed">
                  Клиент
                </Text>
                <Text size="lg" fw={500}>
                  {order.customer.name}
                </Text>
              </div>

              <div>
                <Text size="sm" c="dimmed">
                  Дата заказа
                </Text>
                <Text size="lg">
                  {new Date(order.orderDate).toLocaleDateString('ru-RU')}
                </Text>
              </div>

              <div>
                <Text size="sm" c="dimmed">
                  Статус
                </Text>
                <Badge color={statusColors[order.status]} size="lg">
                  {order.status}
                </Badge>
              </div>

              {order.notes && (
                <div>
                  <Text size="sm" c="dimmed">
                    Примечания
                  </Text>
                  <Text>{order.notes}</Text>
                </div>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Stack gap="md" style={{ flex: 1 }}>
              <div>
                <Text size="sm" c="dimmed">
                  Адрес доставки
                </Text>
                <Text size="lg">{order.customer.address || 'Не указан'}</Text>
              </div>

              <div>
                <Text size="sm" c="dimmed">
                  Телефон
                </Text>
                <Text size="lg">{order.customer.phone || 'Не указан'}</Text>
              </div>

              <div>
                <Text size="sm" c="dimmed">
                  Тип оплаты
                </Text>
                <Text size="lg">{order.customer.paymentType}</Text>
              </div>

              {totalData && (
                <div>
                  <Text size="sm" c="dimmed">
                    Итого
                  </Text>
                  <Text size="xl" fw={700}>
                    {totalData.total.toFixed(2)} ₽
                  </Text>
                </div>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Card shadow="sm" padding="lg" mb="xl">
        <Group justify="space-between" mb="md">
          <Title order={3}>Позиции заказа</Title>
          {canEdit && (
            <Button onClick={() => setAddItemModalOpened(true)}>
              Добавить товар
            </Button>
          )}
        </Group>

        <OrderItemsTable items={order.orderItems} />
      </Card>

      {canChangeStatus() && (
        <Card shadow="sm" padding="lg" mb="xl">
          <Title order={3} mb="md">
            Управление статусом
          </Title>
          <Group>
            <Select
              data={statusOptions}
              value={order.status}
              onChange={handleStatusChange}
              disabled={updateStatus.isPending}
              style={{ minWidth: 200 }}
            />
            {isDelivered && order.deliverySurvey && (
              <Badge color="green">Анкета заполнена</Badge>
            )}
          </Group>
        </Card>
      )}

      {order.deliverySurvey && (
        <Card shadow="sm" padding="lg">
          <Title order={3} mb="md">
            Анкета доставки
          </Title>
          <Stack gap="sm">
            <Group>
              <Text fw={500}>Качество товара:</Text>
              <Badge color={order.deliverySurvey.qualityGood ? 'green' : 'red'}>
                {order.deliverySurvey.qualityGood ? 'Хорошее' : 'Плохое'}
              </Badge>
            </Group>
            <Group>
              <Text fw={500}>Упаковка:</Text>
              <Badge color={order.deliverySurvey.packageGood ? 'green' : 'red'}>
                {order.deliverySurvey.packageGood ? 'Хорошая' : 'Плохая'}
              </Badge>
            </Group>
            <Group>
              <Text fw={500}>Доставка вовремя:</Text>
              <Badge color={order.deliverySurvey.deliveryOnTime ? 'green' : 'red'}>
                {order.deliverySurvey.deliveryOnTime ? 'Да' : 'Нет'}
              </Badge>
            </Group>
            {order.deliverySurvey.comments && (
              <div>
                <Text fw={500}>Комментарии:</Text>
                <Text>{order.deliverySurvey.comments}</Text>
              </div>
            )}
            {order.deliverySurvey.photoUrl && (
              <div>
                <Text fw={500} mb="sm">
                  Фото:
                </Text>
                <img
                  src={order.deliverySurvey.photoUrl}
                  alt="Delivery photo"
                  style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }}
                />
              </div>
            )}
          </Stack>
        </Card>
      )}

      <Card shadow="sm" padding="lg" mb="xl">
        <Group justify="space-between" mb="md">
          <Title order={3}>Документы</Title>
          <Button
            variant="light"
            size="sm"
            leftSection={<IconFileText size={16} />}
            onClick={() => navigate(`/orders/${orderId}/documents`)}
          >
            Открыть
          </Button>
        </Group>
        <Text size="sm" c="dimmed">
          Накладные, счет-фактуры, отчеты о доставке и акты выполненных работ
        </Text>
      </Card>

      <AddItemModal
        opened={addItemModalOpened}
        onClose={() => setAddItemModalOpened(false)}
        orderId={orderId}
      />

      <DeliverySurveyModal
        opened={surveyModalOpened}
        onClose={() => {
          setSurveyModalOpened(false);
          setSelectedStatus(null);
        }}
        orderId={orderId}
        onSuccess={handleSurveySubmitted}
      />
    </Container>
  );
}
