import React from 'react';
import { Card, Text, Stack } from '@mantine/core';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getOrdersByStatus } from '../../utils/analytics';
import type { Order } from '../../types';

interface OrderStatusChartProps {
  orders: Order[] | undefined;
  isLoading?: boolean;
}

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ orders, isLoading }) => {
  if (isLoading) {
    return <Card shadow="sm" padding="lg"><Text c="dimmed">Загрузка...</Text></Card>;
  }

  if (!orders || orders.length === 0) {
    return <Card shadow="sm" padding="lg"><Text c="dimmed">Нет данных для отображения</Text></Card>;
  }

  const statusCounts = getOrdersByStatus(orders);

  const chartData = Object.entries(statusCounts)
    .filter(([_status, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
      status: status,
    }));

  const COLORS: Record<string, string> = {
    'Новый': '#868e96',
    'В сборке': '#ffd43b',
    'Передан курьеру': '#ff922b',
    'Доставлен': '#51cf66',
  };

  const getColor = (entry: { status: string }) => COLORS[entry.status] || '#868e96';

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Text fw={600} size="lg">Распределение заказов по статусам</Text>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }: any) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry)} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => value.toString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Stack>
    </Card>
  );
};
