import React, { useState, useCallback } from 'react';
import type { PeriodType } from '../components/DateRangeFilter';
import { Container, Stack, Paper, Alert, Group, Card, Progress, Text } from '@mantine/core';
import { useOrderStatus } from '../hooks/useOrderReport';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { ReportHeader } from '../components/ReportHeader';
import { LoadingState } from '../components/LoadingState';
import { downloadFile, formatExportFilename } from '../utils/download-file';
import analyticsAPI from '../../../api/analytics';
import { IconAlertCircle, IconCheck, IconClock } from '@tabler/icons-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  'Новый': '#4c6ef5',
  'В сборке': '#ffd43b',
  'Передан курьеру': '#ff922b',
  'Доставлен': '#51cf66',
};

export const OrderStatusReportPage: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error, refetch } = useOrderStatus(
    period,
    startDate?.toISOString().split('T')[0],
    endDate?.toISOString().split('T')[0]
  );

  const handleFilterChange = useCallback(
    (newPeriod: PeriodType, newStartDate?: Date, newEndDate?: Date) => {
      setPeriod(newPeriod);
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    },
    []
  );

  const handleExport = async (format: 'pdf' | 'xlsx') => {
    try {
      setIsExporting(true);
      const blob = await analyticsAPI.exportOrderStatusReport(
        format,
        period,
        startDate?.toISOString().split('T')[0],
        endDate?.toISOString().split('T')[0]
      );
      downloadFile(blob, formatExportFilename('orders-status', format));
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red">
          Не удалось загрузить данные. Попробуйте позже.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <ReportHeader
          title="Отчет по заказам"
          description="Анализ статуса и распределения заказов"
          onExportPDF={() => handleExport('pdf')}
          onExportXLSX={() => handleExport('xlsx')}
          onRefresh={() => refetch()}
          isLoading={isLoading || isExporting}
        />

        <DateRangeFilter onFilterChange={handleFilterChange} defaultPeriod="month" />

        {isLoading ? (
          <LoadingState rows={3} withChart />
        ) : (
          <Stack gap="lg">
            {/* Summary cards */}
            <Group gap="md" grow>
              <Card p="md" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Text size="sm" color="dimmed">
                    Всего заказов
                  </Text>
                  <IconClock size={18} color="#4c6ef5" />
                </Group>
                <Text size="lg" fw={600}>
                  {data?.totalOrders || 0}
                </Text>
              </Card>

              <Card p="md" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Text size="sm" color="dimmed">
                    Доставлено
                  </Text>
                  <IconCheck size={18} color="#51cf66" />
                </Group>
                <Text size="lg" fw={600}>
                  {data?.totalDelivered || 0}
                </Text>
                {data?.totalOrders && data.totalOrders > 0 && (
                  <Progress
                    value={(((data.totalDelivered || 0) / data.totalOrders) * 100)}
                    size="sm"
                    mt="xs"
                    color="green"
                  />
                )}
              </Card>

              <Card p="md" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Text size="sm" color="dimmed">
                    В процессе
                  </Text>
                  <IconClock size={18} color="#ff922b" />
                </Group>
                <Text size="lg" fw={600}>
                  {data?.totalInProgress || 0}
                </Text>
                {data?.totalOrders && data.totalOrders > 0 && (
                  <Progress
                    value={(((data.totalInProgress || 0) / data.totalOrders) * 100)}
                    size="sm"
                    mt="xs"
                    color="orange"
                  />
                )}
              </Card>
            </Group>

            {/* Chart */}
            {data?.distribution && data.distribution.length > 0 && (
              <Paper p="md" radius="md" withBorder>
                <Text size="sm" fw={600} mb="md">
                  Распределение по статусам
                </Text>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.distribution as any}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.status}: ${Math.round(entry.percentage)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.distribution.map((entry) => (
                        <Cell key={`cell-${entry.status}`} fill={STATUS_COLORS[entry.status] || '#999'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            )}

            {/* Detailed table */}
            {data?.distribution && (
              <Paper p="md" radius="md" withBorder>
                <Text size="sm" fw={600} mb="md">
                  Подробно по статусам
                </Text>
                <Stack gap="md">
                  {data.distribution.map((item) => (
                    <div key={item.status}>
                      <Group justify="space-between" mb="xs">
                        <Text size="sm" fw={500}>
                          {item.status}
                        </Text>
                        <Text size="sm" color="dimmed">
                          {item.count} ({Math.round(item.percentage)}%)
                        </Text>
                      </Group>
                      <Progress
                        value={item.percentage}
                        color={STATUS_COLORS[item.status]}
                        size="md"
                      />
                    </div>
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        )}
      </Stack>
    </Container>
  );
};
