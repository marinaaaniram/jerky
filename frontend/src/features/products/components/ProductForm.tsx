import {
  Card,
  Button,
  Group,
  Stack,
  TextInput,
  NumberInput,
  Textarea,
} from '@mantine/core';
import { useState } from 'react';
import type { Product } from '../../../types';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: { name: string; description?: string; price: number; stockQuantity?: number }) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function ProductForm({
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [stockQuantity, setStockQuantity] = useState(initialData?.stockQuantity || 0);

  const handleSubmit = async () => {
    await onSubmit({
      name,
      description: description || undefined,
      price,
      stockQuantity: stockQuantity || undefined,
    });
  };

  const isValid = name.trim().length > 0 && price > 0;

  return (
    <Card shadow="sm" padding="lg">
      <Stack gap="md">
        <TextInput
          label="Наименование"
          placeholder="Введите наименование товара"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />

        <Textarea
          label="Описание"
          placeholder="Дополнительная информация о товаре"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={3}
          disabled={isLoading}
        />

        <NumberInput
          label="Цена"
          placeholder="Введите цену"
          value={price}
          onChange={(value) => setPrice(Number(value) || 0)}
          min={0}
          step={0.01}
          decimalSeparator=","
          thousandSeparator=" "
          required
          disabled={isLoading}
        />

        <NumberInput
          label="Количество на складе"
          placeholder="Введите количество"
          value={stockQuantity}
          onChange={(value) => setStockQuantity(Number(value) || 0)}
          min={0}
          disabled={isLoading}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} loading={isLoading} disabled={!isValid}>
            {initialData ? 'Сохранить' : 'Создать'}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
