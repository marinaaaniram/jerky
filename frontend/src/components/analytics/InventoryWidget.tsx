import React from 'react';
import { Card, Text, Stack, Table, Badge, Tabs } from '@mantine/core';
import { IconAlertCircle, IconTrendingUp } from '@tabler/icons-react';
import { getLowStockProducts } from '../../utils/analytics';
import type { Product, Order } from '../../types';

interface InventoryWidgetProps {
  products: Product[] | undefined;
  orders: Order[] | undefined;
  isLoading?: boolean;
}

export const InventoryWidget: React.FC<InventoryWidgetProps> = ({ products, orders, isLoading }) => {
  if (isLoading) {
    return <Card shadow="sm" padding="lg"><Text c="dimmed">Загрузка...</Text></Card>;
  }

  const lowStockProducts = getLowStockProducts(products || [], 20);

  // Calculate top selling products
  const topSellingMap = new Map<number, { quantity: number; name: string; price: number }>();
  if (orders) {
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const product = products?.find((p) => p.id === item.productId);
        if (product) {
          const key = item.productId;
          if (topSellingMap.has(key)) {
            const existing = topSellingMap.get(key)!;
            existing.quantity += item.quantity;
          } else {
            topSellingMap.set(key, {
              quantity: item.quantity,
              name: product.name,
              price: product.price,
            });
          }
        }
      });
    });
  }

  const topSellingProducts = Array.from(topSellingMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Tabs defaultValue="low-stock">
        <Tabs.List>
          <Tabs.Tab value="low-stock" leftSection={<IconAlertCircle size={14} />}>
            Критические остатки ({lowStockProducts.length})
          </Tabs.Tab>
          <Tabs.Tab value="top-selling" leftSection={<IconTrendingUp size={14} />}>
            Топ продаж
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="low-stock" pt="md">
          {lowStockProducts.length === 0 ? (
            <Text c="dimmed" ta="center" py="md">
              Все товары в норме ✓
            </Text>
          ) : (
            <Stack gap="md">
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Наименование</Table.Th>
                    <Table.Th>На складе</Table.Th>
                    <Table.Th>Статус</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {lowStockProducts.map((product) => (
                    <Table.Tr key={product.id}>
                      <Table.Td>{product.name}</Table.Td>
                      <Table.Td>
                        <Text fw={600}>{product.stockQuantity}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={product.stockQuantity === 0 ? 'red' : product.stockQuantity < 10 ? 'orange' : 'yellow'}
                          variant="light"
                        >
                          {product.stockQuantity === 0 ? 'Нет' : product.stockQuantity < 10 ? 'Критично' : 'Низко'}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="top-selling" pt="md">
          {topSellingProducts.length === 0 ? (
            <Text c="dimmed" ta="center" py="md">
              Нет данных о продажах
            </Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Наименование</Table.Th>
                  <Table.Th>Продано</Table.Th>
                  <Table.Th>Цена</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {topSellingProducts.map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{item.name}</Table.Td>
                    <Table.Td>
                      <Badge variant="light">{item.quantity} шт</Badge>
                    </Table.Td>
                    <Table.Td>{item.price.toFixed(2)} ₽</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
};
