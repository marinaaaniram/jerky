import React, { useState, useCallback } from 'react';
import type { PeriodType } from '../components/DateRangeFilter';
import { Container, Stack, Table, Paper, Alert, Group, SegmentedControl } from '@mantine/core';
import { useTopProducts } from '../hooks/useProductReport';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { ReportHeader } from '../components/ReportHeader';
import { LoadingState } from '../components/LoadingState';
import { downloadFile, formatExportFilename } from '../utils/download-file';
import analyticsAPI from '../../../api/analytics';
import { IconAlertCircle } from '@tabler/icons-react';

type SortBy = 'quantity' | 'revenue';

export const ProductReportPage: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [sortBy, setSortBy] = useState<SortBy>('quantity');
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error, refetch } = useTopProducts(
    period,
    startDate?.toISOString().split('T')[0],
    endDate?.toISOString().split('T')[0],
    sortBy
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
      const blob = await analyticsAPI.exportProductReport(
        format,
        period,
        startDate?.toISOString().split('T')[0],
        endDate?.toISOString().split('T')[0]
      );
      downloadFile(blob, formatExportFilename('products-report', format));
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(value);
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
          title="Отчет по товарам"
          description="Анализ продаж по товарам"
          onExportPDF={() => handleExport('pdf')}
          onExportXLSX={() => handleExport('xlsx')}
          onRefresh={() => refetch()}
          isLoading={isLoading || isExporting}
        />

        <Stack gap="md">
          <DateRangeFilter onFilterChange={handleFilterChange} defaultPeriod="month" />

          <Group gap="md" justify="space-between">
            <div>
              <div style={{ fontSize: 12, color: '#868e96', marginBottom: 4 }}>Сортировать по:</div>
              <SegmentedControl
                data={[
                  { label: 'Количество', value: 'quantity' },
                  { label: 'Выручка', value: 'revenue' },
                ]}
                value={sortBy}
                onChange={(value) => setSortBy(value as SortBy)}
              />
            </div>
          </Group>
        </Stack>

        {isLoading ? (
          <LoadingState rows={5} />
        ) : (
          <Paper p="md" radius="md" withBorder>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Продано</th>
                  <th>Выручка</th>
                  <th>Средняя цена</th>
                  <th>Остаток</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.totalQuantity} шт</td>
                    <td>{formatCurrency(product.totalRevenue)}</td>
                    <td>{formatCurrency(product.averagePrice)}</td>
                    <td>{product.currentStock} шт</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};
