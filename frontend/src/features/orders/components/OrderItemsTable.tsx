import { Table, Text } from '@mantine/core';
import type { OrderItem } from '../../../types';

interface OrderItemsTableProps {
  items: OrderItem[];
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  if (items.length === 0) {
    return <Text c="dimmed">Товаров в заказе пока нет</Text>;
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Table striped>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Товар</Table.Th>
          <Table.Th>Цена</Table.Th>
          <Table.Th>Количество</Table.Th>
          <Table.Th>Сумма</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {items.map((item) => (
          <Table.Tr key={item.id}>
            <Table.Td>{item.product.name}</Table.Td>
            <Table.Td>{item.price.toFixed(2)} ₽</Table.Td>
            <Table.Td>{item.quantity}</Table.Td>
            <Table.Td>{(item.price * item.quantity).toFixed(2)} ₽</Table.Td>
          </Table.Tr>
        ))}
        <Table.Tr>
          <Table.Td colSpan={3} style={{ textAlign: 'right' }}>
            <Text fw={700}>Итого:</Text>
          </Table.Td>
          <Table.Td>
            <Text fw={700}>{total.toFixed(2)} ₽</Text>
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
}
