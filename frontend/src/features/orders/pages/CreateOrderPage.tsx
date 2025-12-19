import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Card,
  Button,
  Group,
  Stack,
  Select,
  Textarea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCustomers } from '../../../hooks/useCustomers';
import { useCreateOrder } from '../hooks/useOrders';

export function CreateOrderPage() {
  const navigate = useNavigate();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const createOrder = useCreateOrder();

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const customerOptions = customers.map((customer) => ({
    value: customer.id.toString(),
    label: `${customer.name} (${customer.phone})`,
  }));

  const handleSubmit = async () => {
    if (!customerId) {
      notifications.show({
        title: 'Ошибка',
        message: 'Выберите клиента',
        color: 'red',
      });
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        customerId: Number(customerId),
        notes: notes || undefined,
      });

      notifications.show({
        title: 'Успех',
        message: 'Заказ создан',
        color: 'green',
      });

      navigate(`/orders/${order.id}`);
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось создать заказ',
        color: 'red',
      });
    }
  };

  return (
    <Container size="xl">
      <Group justify="flex-start" mb="xl" gap="xs">
        <Button variant="subtle" onClick={() => navigate('/orders')}>
          Назад
        </Button>
        <Title order={2} style={{ flexGrow: 1 }}>Создать новый заказ</Title>
      </Group>

      <Card shadow="sm" padding="lg">
        <Stack gap="md">
          <Select
            label="Клиент"
            placeholder="Выберите клиента"
            data={customerOptions}
            value={customerId}
            onChange={setCustomerId}
            disabled={customersLoading}
            searchable
            required
          />

          <Textarea
            label="Примечания"
            placeholder="Дополнительная информация о заказе"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            minRows={3}
          />

          <Group justify="flex-start" mt="md">
            <Button variant="subtle" onClick={() => navigate('/orders')}>
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createOrder.isPending}
              disabled={!customerId}
            >
              Создать заказ
            </Button>
          </Group>
        </Stack>
      </Card>
    </Container>
  );
}
