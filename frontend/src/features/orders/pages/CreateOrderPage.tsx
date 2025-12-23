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
  Table,
  NumberInput,
  Text,
} from '@mantine/core';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useCustomers } from '../../../hooks/useCustomers';
import { useCreateOrder, useAddOrderItem } from '../hooks/useOrders';
import { useProducts } from '../../products/hooks/useProducts';
import { TableActionMenu } from '../../../components/TableActionMenu';

interface OrderItemDraft {
  productId: number;
  quantity: number;
  productName: string;
  price: number;
}

export function CreateOrderPage() {
  const navigate = useNavigate();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const createOrder = useCreateOrder();
  const addOrderItem = useAddOrderItem();

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItemDraft[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const customerOptions = customers.map((customer) => ({
    value: customer.id.toString(),
    label: `${customer.name} (${customer.phone})`,
  }));

  const productOptions = products.map((product) => ({
    value: product.id.toString(),
    label: `${product.name} (${product.price} ₽, на складе: ${product.stockQuantity})`,
  }));

  const handleAddItem = () => {
    if (!selectedProductId) {
      notifications.show({
        title: 'Ошибка',
        message: 'Выберите товар',
        color: 'red',
      });
      return;
    }

    if (quantity < 1) {
      notifications.show({
        title: 'Ошибка',
        message: 'Количество должно быть больше 0',
        color: 'red',
      });
      return;
    }

    const product = products.find((p) => p.id.toString() === selectedProductId);
    if (!product) return;

    // Check if product already exists in items
    const existingItemIndex = items.findIndex((item) => item.productId === product.id);
    if (existingItemIndex >= 0) {
      // Update quantity
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      setItems(updatedItems);
    } else {
      // Add new item
      setItems([
        ...items,
        {
          productId: product.id,
          quantity,
          productName: product.name,
          price: product.price,
        },
      ]);
    }

    // Reset form
    setSelectedProductId(null);
    setQuantity(1);
    notifications.show({
      title: 'Успех',
      message: 'Товар добавлен',
      color: 'green',
    });
  };

  const handleRemoveItem = (productId: number) => {
    setItems(items.filter((item) => item.productId !== productId));
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async () => {
    if (!customerId) {
      notifications.show({
        title: 'Ошибка',
        message: 'Выберите клиента',
        color: 'red',
      });
      return;
    }

    if (items.length === 0) {
      notifications.show({
        title: 'Ошибка',
        message: 'Добавьте хотя бы один товар',
        color: 'red',
      });
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        customerId: Number(customerId),
        notes: notes || undefined,
      });

      // Add all items to the order
      for (const item of items) {
        await addOrderItem.mutateAsync({
          orderId: order.id,
          itemData: {
            productId: item.productId,
            quantity: item.quantity,
          },
        });
      }

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
    <Container size="xl" pt={0} py={0} mt={0}>
      <Group justify="flex-start" mb="xl" mt={0} gap="xs">
        <Button variant="subtle" onClick={() => navigate('/orders')} leftSection={<IconArrowLeft size={18} />}>
          Назад
        </Button>
        <Title order={2} style={{ flexGrow: 1 }}>Создать новый заказ</Title>
      </Group>

      <Card shadow="sm" padding="lg" mb="lg">
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
        </Stack>
      </Card>

      <Card shadow="sm" padding="lg" mb="lg">
        <Stack gap="md">
          <Title order={3}>Позиции заказа</Title>

          <Stack gap="sm">
            <Select
              label="Товар"
              placeholder="Выберите товар"
              data={productOptions}
              value={selectedProductId}
              onChange={setSelectedProductId}
              disabled={productsLoading}
              searchable
            />

            <NumberInput
              label="Количество"
              placeholder="Введите количество"
              value={quantity}
              onChange={(val) => setQuantity(val as number)}
              min={1}
            />

            <Button onClick={handleAddItem} disabled={!selectedProductId || quantity < 1}>
              Добавить товар
            </Button>
          </Stack>

          {items.length > 0 && (
            <>
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Товар</Table.Th>
                    <Table.Th>Цена</Table.Th>
                    <Table.Th>Количество</Table.Th>
                    <Table.Th>Сумма</Table.Th>
                    <Table.Th>Действие</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((item) => (
                    <Table.Tr key={item.productId}>
                      <Table.Td>{item.productName}</Table.Td>
                      <Table.Td>{item.price.toFixed(2)} ₽</Table.Td>
                      <Table.Td>{item.quantity}</Table.Td>
                      <Table.Td>{(item.price * item.quantity).toFixed(2)} ₽</Table.Td>
                      <Table.Td>
                        <TableActionMenu
                          actions={[
                            {
                              label: 'Удалить',
                              onClick: () => handleRemoveItem(item.productId),
                              color: 'red',
                              icon: <IconTrash size={14} />,
                            },
                          ]}
                        />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              <Group justify="space-between">
                <Text fw={700}>Итого:</Text>
                <Text fw={700}>{totalPrice.toFixed(2)} ₽</Text>
              </Group>
            </>
          )}

          {items.length === 0 && (
            <Text c="dimmed" ta="center">
              Товаров не добавлено
            </Text>
          )}
        </Stack>
      </Card>

      <Group justify="flex-start">
        <Button variant="subtle" onClick={() => navigate('/orders')}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          loading={createOrder.isPending}
          disabled={!customerId || items.length === 0}
        >
          Создать заказ
        </Button>
      </Group>
    </Container>
  );
}
