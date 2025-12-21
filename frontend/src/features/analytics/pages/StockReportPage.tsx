import React, { useState, useCallback } from 'react';
import type { PeriodType } from '../components/DateRangeFilter';
import { Container, Stack, Table, Tabs, Badge, Paper, Alert, Group, SegmentedControl } from '@mantine/core';
import { useStockMovements, useStockLevels } from '../hooks/useStockReport';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { ReportHeader } from '../components/ReportHeader';
import { LoadingState } from '../components/LoadingState';
import { downloadFile, formatExportFilename } from '../utils/download-file';
import analyticsAPI from '../../../api/analytics';
import { IconAlertCircle } from '@tabler/icons-react';

type StockStatus = 'low' | 'zero' | 'overstocked' | 'all' | 'normal';

const getStatusColor = (status: StockStatus): string => {
  switch (status) {
    case 'zero':
      return 'red';
    case 'low':
      return 'orange';
    case 'overstocked':
      return 'yellow';
    default:
      return 'blue';
  }
};

export const StockReportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('movements');
  const [period, setPeriod] = useState<PeriodType>('month');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [stockStatus, setStockStatus] = useState<StockStatus>('all');
  const [isExporting, setIsExporting] = useState(false);

  const movementsQuery = useStockMovements(
    period,
    startDate?.toISOString().split('T')[0],
    endDate?.toISOString().split('T')[0]
  );

  const levelsQuery = useStockLevels(stockStatus);

  const handleFilterChange = useCallback(
    (newPeriod: PeriodType, newStartDate?: Date, newEndDate?: Date) => {
      setPeriod(newPeriod);
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    },
    []
  );

  const handleExport = async (format: 'pdf' | 'xlsx', type: 'movements' | 'levels') => {
    try {
      setIsExporting(true);
      const blob = await analyticsAPI.exportStockReport(format, type);
      downloadFile(blob, formatExportFilename(`stock-${type}`, format));
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

  const isLoading = activeTab === 'movements' ? movementsQuery.isLoading : levelsQuery.isLoading;
  const error = activeTab === 'movements' ? movementsQuery.error : levelsQuery.error;

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
          title="Отчет по складу"
          description="Анализ движений и уровней запасов"
          onExportPDF={() => handleExport('pdf', activeTab as 'movements' | 'levels')}
          onExportXLSX={() => handleExport('xlsx', activeTab as 'movements' | 'levels')}
          isLoading={isExporting}
        />

        <Tabs value={activeTab} onChange={(val: string | null) => setActiveTab((val || 'movements') as 'movements' | 'levels')}>
          <Tabs.List>
            <Tabs.Tab value="movements">Движения</Tabs.Tab>
            <Tabs.Tab value="levels">Остатки</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="movements" pt="md">
            <Stack gap="md">
              <DateRangeFilter onFilterChange={handleFilterChange} defaultPeriod="month" />

              {isLoading ? (
                <LoadingState rows={5} />
              ) : (
                <Paper p="md" radius="md" withBorder>
                  <Table striped highlightOnHover>
                    <thead>
                      <tr>
                        <th>Товар</th>
                        <th>Количество</th>
                        <th>Тип</th>
                        <th>Причина</th>
                        <th>Дата</th>
                        <th>Пользователь</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movementsQuery.data?.data.map((movement) => (
                        <tr key={movement.id}>
                          <td>{movement.productName}</td>
                          <td>
                            <Badge color={movement.quantityChange > 0 ? 'green' : 'red'}>
                              {movement.quantityChange > 0 ? '+' : ''}
                              {movement.quantityChange}
                            </Badge>
                          </td>
                          <td>{movement.reason}</td>
                          <td>{movement.reasonText || '-'}</td>
                          <td>{new Date(movement.movementDate).toLocaleDateString('ru-RU')}</td>
                          <td>{movement.userName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Paper>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="levels" pt="md">
            <Stack gap="md">
              <Group justify="space-between">
                <div>
                  <div style={{ fontSize: 12, color: '#868e96', marginBottom: 4 }}>
                    Фильтр по статусу:
                  </div>
                  <SegmentedControl
                    data={[
                      { label: 'Все', value: 'all' },
                      { label: 'Нулевой', value: 'zero' },
                      { label: 'Низкий', value: 'low' },
                      { label: 'Избыток', value: 'overstocked' },
                    ]}
                    value={stockStatus}
                    onChange={(value) => setStockStatus(value as StockStatus)}
                  />
                </div>
              </Group>

              {isLoading ? (
                <LoadingState rows={5} />
              ) : (
                <>
                  {levelsQuery.data?.summary && (
                    <Group justify="space-between">
                      <div>
                        <div style={{ fontSize: 12, color: '#868e96', marginBottom: 4 }}>
                          Всего товаров
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>
                          {levelsQuery.data.summary.totalProducts}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#868e96', marginBottom: 4 }}>
                          Нулевой остаток
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: '#f03e3e' }}>
                          {levelsQuery.data.summary.zeroStockCount}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#868e96', marginBottom: 4 }}>
                          Низкий остаток
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: '#fd7e14' }}>
                          {levelsQuery.data.summary.lowStockCount}
                        </div>
                      </div>
                    </Group>
                  )}

                  <Paper p="md" radius="md" withBorder>
                    <Table striped highlightOnHover>
                      <thead>
                        <tr>
                          <th>Товар</th>
                          <th>Остаток</th>
                          <th>Цена</th>
                          <th>Статус</th>
                        </tr>
                      </thead>
                      <tbody>
                        {levelsQuery.data?.data.map((level) => (
                          <tr key={level.id}>
                            <td>{level.name}</td>
                            <td>{level.currentStock} шт</td>
                            <td>{formatCurrency(level.price)}</td>
                            <td>
                              <Badge color={getStatusColor(level.status)}>
                                {level.status === 'zero'
                                  ? 'Нулевой'
                                  : level.status === 'low'
                                  ? 'Низкий'
                                  : level.status === 'overstocked'
                                  ? 'Избыток'
                                  : 'Нормально'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Paper>
                </>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
};
