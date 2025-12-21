import { useQuery } from '@tanstack/react-query';
import { Timeline, Text, Badge, Group, Stack, Paper, Avatar } from '@mantine/core';
import {
  IconBox,
  IconMoneybag,
  IconEdit,
  IconArchive,
  IconArchiveOff,
  IconShoppingCart,
} from '@tabler/icons-react';
import apiClient from '../../../api/client';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Interaction {
  id: number;
  type: string;
  description: string;
  metadata?: Record<string, any>;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
}

interface CustomerInteractionTimelineProps {
  customerId: number;
}

const getIconForType = (type: string) => {
  const iconProps = { size: 16 };
  switch (type) {
    case 'ORDER_CREATED':
      return <IconShoppingCart {...iconProps} />;
    case 'ORDER_DELIVERED':
      return <IconBox {...iconProps} />;
    case 'PAYMENT_RECEIVED':
      return <IconMoneybag {...iconProps} />;
    case 'CUSTOMER_DATA_UPDATED':
      return <IconEdit {...iconProps} />;
    case 'ARCHIVED':
      return <IconArchive {...iconProps} />;
    case 'UNARCHIVED':
      return <IconArchiveOff {...iconProps} />;
    default:
      return null;
  }
};

const getColorForType = (type: string) => {
  switch (type) {
    case 'ORDER_CREATED':
      return 'blue';
    case 'ORDER_DELIVERED':
      return 'green';
    case 'PAYMENT_RECEIVED':
      return 'teal';
    case 'CUSTOMER_DATA_UPDATED':
      return 'orange';
    case 'ARCHIVED':
      return 'red';
    case 'UNARCHIVED':
      return 'yellow';
    default:
      return 'gray';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'ORDER_CREATED':
      return 'Заказ создан';
    case 'ORDER_DELIVERED':
      return 'Заказ доставлен';
    case 'PAYMENT_RECEIVED':
      return 'Платёж получен';
    case 'CUSTOMER_DATA_UPDATED':
      return 'Данные изменены';
    case 'ARCHIVED':
      return 'Архивирован';
    case 'UNARCHIVED':
      return 'Восстановлен';
    default:
      return type;
  }
};

export function CustomerInteractionTimeline({ customerId }: CustomerInteractionTimelineProps) {
  const { data: interactionsData, isLoading } = useQuery({
    queryKey: ['customer-interactions', customerId],
    queryFn: async () => {
      const response = await apiClient.get(`/customers/${customerId}/interactions?limit=100&offset=0`);
      return response.data;
    },
    enabled: !!customerId,
  });

  const interactions = interactionsData?.data || [];

  if (isLoading) {
    return <Text c="dimmed" ta="center">Загрузка истории...</Text>;
  }

  if (interactions.length === 0) {
    return <Text c="dimmed" ta="center">Нет истории взаимодействий</Text>;
  }

  return (
    <Stack>
      <Timeline active={interactions.length} bulletSize={24} lineWidth={2}>
        {interactions.map((interaction: Interaction) => (
          <Timeline.Item
            key={interaction.id}
            bullet={getIconForType(interaction.type)}
            title={
              <Group gap="xs">
                <Text fw={600}>{getTypeLabel(interaction.type)}</Text>
                <Badge size="sm" color={getColorForType(interaction.type)}>
                  {getColorForType(interaction.type)}
                </Badge>
              </Group>
            }
          >
            <Paper p="md" radius="md" withBorder mt="md">
              <Stack gap="xs">
                <Text size="sm">{interaction.description}</Text>

                <Group justify="space-between">
                  {interaction.user ? (
                    <Group gap="xs">
                      <Avatar
                        name={`${interaction.user.firstName} ${interaction.user.lastName}`}
                        color="blue"
                        size="sm"
                        radius="xl"
                      />
                      <div>
                        <Text size="xs" fw={500}>
                          {interaction.user.firstName} {interaction.user.lastName}
                        </Text>
                      </div>
                    </Group>
                  ) : (
                    <Text size="xs" c="dimmed">Система</Text>
                  )}

                  <Text size="xs" c="dimmed">
                    {formatDistanceToNow(new Date(interaction.createdAt), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </Text>
                </Group>

                {interaction.metadata && Object.keys(interaction.metadata).length > 0 && (
                  <Paper p="xs" bg="gray.0" radius="md">
                    <Stack gap={2}>
                      {Object.entries(interaction.metadata).map(([key, value]) => (
                        <Group key={key} justify="space-between" gap="xs">
                          <Text size="xs" fw={500} c="dimmed">
                            {key}:
                          </Text>
                          <Text size="xs" c="dimmed">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </Paper>
          </Timeline.Item>
        ))}
      </Timeline>
    </Stack>
  );
}
