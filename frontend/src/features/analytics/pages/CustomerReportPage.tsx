import React, { useState, useCallback } from 'react';
import type { PeriodType } from '../components/DateRangeFilter';
import { Container, Stack, Table, Tabs, Badge, Paper, Alert, Group } from '@mantine/core';
import { useTopCustomers, useDebtors } from '../hooks/useCustomerReport';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { ReportHeader } from '../components/ReportHeader';
import { LoadingState } from '../components/LoadingState';
import { downloadFile, formatExportFilename } from '../utils/download-file';
import analyticsAPI from '../../../api/analytics';
import { IconAlertCircle } from '@tabler/icons-react';

export const CustomerReportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('top');
  const [period, setPeriod] = useState<PeriodType>('month');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);

  const topCustomersQuery = useTopCustomers(
    period,
    startDate?.toISOString().split('T')[0],
    endDate?.toISOString().split('T')[0]
  );

  const debtorsQuery = useDebtors();

  const handleFilterChange = useCallback(
    (newPeriod: PeriodType, newStartDate?: Date, newEndDate?: Date) => {
      setPeriod(newPeriod);
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    },
    []
  );

  const handleExport = async (format: 'pdf' | 'xlsx', type: 'top' | 'debtors') => {
    try {
      setIsExporting(true);
      const blob = await analyticsAPI.exportCustomerReport(format, type);
      downloadFile(blob, formatExportFilename(`customers-${type}`, format));
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

  const isLoading = activeTab === 'top' ? topCustomersQuery.isLoading : debtorsQuery.isLoading;
  const error = activeTab === 'top' ? topCustomersQuery.error : debtorsQuery.error;

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
          title="Отчет по клиентам"
          description="Анализ топ клиентов и должников"
          onExportPDF={() => handleExport('pdf', activeTab as 'top' | 'debtors')}
          onExportXLSX={() => handleExport('xlsx', activeTab as 'top' | 'debtors')}
          isLoading={isExporting}
        />

        <Tabs value={activeTab} onChange={(val: string | null) => setActiveTab(val || 'top')}>
          <Tabs.List>
            <Tabs.Tab value="top">Топ клиенты</Tabs.Tab>
            <Tabs.Tab value="debtors">Должники</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="top" pt="md">
            <Stack gap="md">
              <DateRangeFilter onFilterChange={handleFilterChange} defaultPeriod="month" />

              {isLoading ? (
                <LoadingState rows={5} />
              ) : (
                <Paper p="md" radius="md" withBorder>
                  <Table striped highlightOnHover>
                    <thead>
                      <tr>
                        <th>Клиент</th>
                        <th>Телефон</th>
                        <th>Заказов</th>
                        <th>Выручка</th>
                        <th>Средний чек</th>
                        <th>Тип платежа</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCustomersQuery.data?.data.map((customer) => (
                        <tr key={customer.id}>
                          <td>{customer.name}</td>
                          <td>{customer.phone || '-'}</td>
                          <td>{customer.totalOrders}</td>
                          <td>{formatCurrency(customer.totalRevenue)}</td>
                          <td>{formatCurrency(customer.averageOrderValue)}</td>
                          <td>
                            <Badge>{customer.paymentType}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Paper>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="debtors" pt="md">
            {isLoading ? (
              <LoadingState rows={5} />
            ) : (
              <>
                {debtorsQuery.data?.data && debtorsQuery.data.data.length > 0 && (
                  <Paper p="md" radius="md" withBorder mb="md">
                    <Group justify="space-between">
                      <div>
                        <div style={{ fontSize: 12, color: '#868e96', marginBottom: 4 }}>
                          Общая задолженность
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>
                          {formatCurrency(debtorsQuery.data.totalDebt)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#868e96', marginBottom: 4 }}>
                          Должников
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>
                          {debtorsQuery.data.data.length}
                        </div>
                      </div>
                    </Group>
                  </Paper>
                )}

                <Paper p="md" radius="md" withBorder>
                  <Table striped highlightOnHover>
                    <thead>
                      <tr>
                        <th>Клиент</th>
                        <th>Телефон</th>
                        <th>Задолженность</th>
                        <th>Последний заказ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debtorsQuery.data?.data.map((debtor) => (
                        <tr key={debtor.id}>
                          <td>{debtor.name}</td>
                          <td>{debtor.phone || '-'}</td>
                          <td>
                            <Badge color="red">{formatCurrency(debtor.currentDebt)}</Badge>
                          </td>
                          <td>{new Date(debtor.lastOrderDate).toLocaleDateString('ru-RU')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Paper>
              </>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
};
