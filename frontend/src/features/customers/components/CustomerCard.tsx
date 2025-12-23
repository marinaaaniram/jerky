import { Card, Stack, Text, Badge, ActionIcon, Menu, rem, Flex } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import type { Customer } from '../../../types';
import { PaymentType } from '../../../types';

interface CustomerCardProps {
  customer: Customer;
  onEdit: (id: number) => void;
  onArchive: (id: number) => void;
}

export function CustomerCard({ customer, onEdit, onArchive }: CustomerCardProps) {
  const paymentTypeLabel = customer.paymentType === PaymentType.DIRECT ? 'Прямые' : 'Реализация';
  const paymentTypeColor = customer.paymentType === PaymentType.DIRECT ? 'blue' : 'grape';

  return (
    <Card withBorder padding="md" radius="md">
      <Flex justify="space-between" align="flex-start" mb="sm">
        <Stack gap={0} flex={1}>
          {customer.isArchived && (
            <Badge size="sm" color="gray" w="fit-content">Архив</Badge>
          )}
          <Text fw={600} size="lg" mt={customer.isArchived ? 8 : 0}>{customer.name}</Text>
        </Stack>

        <Menu position="bottom-end" shadow="md">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="sm">
              <IconDots style={{ width: rem(16), height: rem(16) }} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item onClick={() => onEdit(customer.id)}>Редактировать</Menu.Item>
            {!customer.isArchived && (
              <Menu.Item color="orange" onClick={() => onArchive(customer.id)}>
                Архивировать
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </Flex>

      <Stack gap="xs">
        <Flex justify="space-between" align="center">
          <Text size="sm" c="dimmed">Телефон</Text>
          <Text size="sm" fw={500}>{customer.phone || '-'}</Text>
        </Flex>

        <Flex justify="space-between" align="center">
          <Text size="sm" c="dimmed">Тип оплаты</Text>
          <Badge size="sm" color={paymentTypeColor}>{paymentTypeLabel}</Badge>
        </Flex>

        <Flex justify="space-between" align="center">
          <Text size="sm" c="dimmed">Долг</Text>
          <Text size="sm" fw={600} c={customer.debt > 0 ? 'red' : 'green'}>
            {customer.debt.toFixed(2)} ₽
          </Text>
        </Flex>
      </Stack>
    </Card>
  );
}
