import React from 'react';
import { Card, Text, Group, ThemeIcon, Stack } from '@mantine/core';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color = 'blue',
  description,
}) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="sm">
        <Stack gap={0} style={{ flex: 1 }}>
          <Text size="sm" c="dimmed" fw={500}>
            {label}
          </Text>
          <Text size="xl" fw={700}>
            {value}
          </Text>
          {description && (
            <Text size="xs" c="dimmed" mt="xs">
              {description}
            </Text>
          )}
        </Stack>
        <ThemeIcon size="lg" radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
};
