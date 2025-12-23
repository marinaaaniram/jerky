import { Card, Group, Stack, Text, Badge, ActionIcon, Menu, rem, Flex } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import type { Product } from '../../../types';

interface ProductCardProps {
  product: Product;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const stockStatus = product.stockQuantity > 0 ? 'green' : 'red';
  const stockLabel = product.stockQuantity > 0 ? 'В наличии' : 'Нет в наличии';

  return (
    <Card withBorder padding="md" radius="md">
      <Flex justify="space-between" align="flex-start" mb="sm">
        <Stack gap={0} flex={1}>
          <Text fw={600} size="lg">{product.name}</Text>
        </Stack>

        <Menu position="bottom-end" shadow="md">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="sm">
              <IconDots style={{ width: rem(16), height: rem(16) }} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item onClick={() => onEdit(product.id)}>Редактировать</Menu.Item>
            <Menu.Item color="red" onClick={() => onDelete(product.id)}>
              Удалить
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Flex>

      {product.description && (
        <Text size="sm" c="dimmed" mb="xs" lineClamp={2}>
          {product.description}
        </Text>
      )}

      <Stack gap="xs">
        <Flex justify="space-between" align="center">
          <Text size="sm" c="dimmed">Цена</Text>
          <Text size="sm" fw={600}>{product.price.toFixed(2)} ₽</Text>
        </Flex>

        <Flex justify="space-between" align="center">
          <Text size="sm" c="dimmed">На складе</Text>
          <Group gap={6}>
            <Badge size="sm" color={stockStatus}>{product.stockQuantity}</Badge>
            <Text size="xs" c="dimmed">{stockLabel}</Text>
          </Group>
        </Flex>
      </Stack>
    </Card>
  );
}
