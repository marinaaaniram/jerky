import React, { useState, useCallback } from 'react';
import type { PeriodType } from '../components/DateRangeFilter';
import { Container, Stack, Table, Group, Paper, Alert } from '@mantine/core';
import { useSalesReport } from '../hooks/useSalesReport';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { ReportHeader } from '../components/ReportHeader';
import { LoadingState } from '../components/LoadingState';
import { downloadFile, formatExportFilename } from '../utils/download-file';
import analyticsAPI from '../../../api/analytics';
import { IconAlertCircle } from '@tabler/icons-react';

export const SalesReportPage: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error, refetch } = useSalesReport(
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

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const blob = await analyticsAPI.exportSalesReport(
        'pdf',
        period,
        startDate?.toISOString().split('T')[0],
        endDate?.toISOString().split('T')[0]
      );
      downloadFile(blob, formatExportFilename('sales-report', 'pdf'));
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportXLSX = async () => {
    try {
      setIsExporting(true);
      const blob = await analyticsAPI.exportSalesReport(
        'xlsx',
        period,
        startDate?.toISOString().split('T')[0],
        endDate?.toISOString().split('T')[0]
      );
      downloadFile(blob, formatExportFilename('sales-report', 'xlsx'));
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

  const rows = data?.data.map((item) => (
    <tr key={item.period}>
      <td>{item.period}</td>
      <td>{item.orderCount}</td>
      <td>{formatCurrency(item.revenue)}</td>
      <td>{formatCurrency(item.averageCheck)}</td>
    </tr>
  ));

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
          title="Отчет о продажах"
          description="Анализ выручки, количества заказов и среднего чека"
          onExportPDF={handleExportPDF}
          onExportXLSX={handleExportXLSX}
          onRefresh={() => refetch()}
          isLoading={isLoading || isExporting}
        />

        <DateRangeFilter onFilterChange={handleFilterChange} defaultPeriod="month" />

        {data && (
          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <div>
                <div style={{ fontSize: 12, color: '#868e96', marginBottom: 4 }}>Общая выручка</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                  {formatCurrency(data.totalRevenue)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#868e96', marginBottom: 4 }}>Всего заказов</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{data.totalOrders}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#868e96', marginBottom: 4 }}>Средний чек</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                  {formatCurrency(data.totalAverageCheck)}
                </div>
              </div>
            </Group>
          </Paper>
        )}

        {isLoading ? (
          <LoadingState rows={5} />
        ) : (
          <Paper p="md" radius="md" withBorder>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Период</th>
                  <th>Заказов</th>
                  <th>Выручка</th>
                  <th>Средний чек</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </Table>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};
