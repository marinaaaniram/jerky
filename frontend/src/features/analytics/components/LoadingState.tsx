import React from 'react';
import { Skeleton, Stack, Group } from '@mantine/core';

interface LoadingStateProps {
  rows?: number;
  withChart?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ rows = 5, withChart = false }) => {
  return (
    <Stack gap="md">
      {withChart && (
        <div style={{ width: '100%', height: 300 }}>
          <Skeleton height="100%" width="100%" radius="md" />
        </div>
      )}

      <Stack gap="sm">
        {Array.from({ length: rows }).map((_, i) => (
          <Group key={i} gap="md">
            <Skeleton height={20} width="20%" radius="md" />
            <Skeleton height={20} width="30%" radius="md" />
            <Skeleton height={20} width="25%" radius="md" />
            <Skeleton height={20} width="25%" radius="md" />
          </Group>
        ))}
      </Stack>
    </Stack>
  );
};
