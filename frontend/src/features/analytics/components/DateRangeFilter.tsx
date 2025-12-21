import React, { useState } from 'react';
import { Button, Group, Stack, Badge } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';

export type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom';

interface DateRangeFilterProps {
  onFilterChange: (period: PeriodType, startDate?: Date, endDate?: Date) => void;
  defaultPeriod?: PeriodType;
}

const QUICK_FILTERS = [
  { label: 'Сегодня', value: 'day' as PeriodType },
  { label: 'Неделя', value: 'week' as PeriodType },
  { label: 'Месяц', value: 'month' as PeriodType },
  { label: 'Квартал', value: 'quarter' as PeriodType },
  { label: 'Год', value: 'year' as PeriodType },
  { label: 'Всё время', value: 'all' as PeriodType },
];

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onFilterChange,
  defaultPeriod = 'month',
}) => {
  const [period, setPeriod] = useState<PeriodType>(defaultPeriod);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleQuickFilter = (p: PeriodType) => {
    setPeriod(p);
    setStartDate(null);
    setEndDate(null);
    onFilterChange(p);
  };

  const handleCustomFilter = () => {
    if (startDate && endDate) {
      setPeriod('custom');
      onFilterChange('custom', startDate, endDate);
    }
  };

  return (
    <Stack gap="md">
      <Group gap="xs">
        {QUICK_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant={period === filter.value ? 'filled' : 'light'}
            size="sm"
            onClick={() => handleQuickFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </Group>

      {period === 'custom' && (
        <Group gap="md">
          <DatePickerInput
            label="От"
            placeholder="Выберите дату"
            leftSection={<IconCalendar size={16} />}
            value={startDate}
            onChange={setStartDate}
            clearable
            maxDate={endDate || new Date()}
          />
          <DatePickerInput
            label="До"
            placeholder="Выберите дату"
            leftSection={<IconCalendar size={16} />}
            value={endDate}
            onChange={setEndDate}
            clearable
            minDate={startDate || new Date(2020, 0, 1)}
          />
          <Button onClick={handleCustomFilter} mt="md">
            Применить
          </Button>
        </Group>
      )}

      {period === 'custom' && startDate && endDate && (
        <Badge>
          {startDate.toLocaleDateString('ru-RU')} - {endDate.toLocaleDateString('ru-RU')}
        </Badge>
      )}
    </Stack>
  );
};
