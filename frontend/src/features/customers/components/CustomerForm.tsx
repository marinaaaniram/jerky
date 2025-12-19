import {
  Card,
  Button,
  Group,
  Stack,
  TextInput,
  Select,
  NumberInput,
} from '@mantine/core';
import { useState } from 'react';
import type { Customer, PaymentType } from '../../../types';
import { PaymentType as PaymentTypeEnum } from '../../../types';

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: { name: string; address?: string; phone?: string; paymentType: PaymentType }) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function CustomerForm({
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
}: CustomerFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [paymentType, setPaymentType] = useState<PaymentType | null>(initialData?.paymentType || null);

  const handleSubmit = async () => {
    if (!paymentType) return;
    await onSubmit({
      name,
      address: address || undefined,
      phone: phone || undefined,
      paymentType,
    });
  };

  const isValid = name.trim().length > 0 && paymentType;

  return (
    <Card shadow="sm" padding="lg">
      <Stack gap="md">
        <TextInput
          label="Наименование"
          placeholder="Введите наименование клиента"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />

        <TextInput
          label="Адрес"
          placeholder="Введите адрес доставки"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isLoading}
        />

        <TextInput
          label="Телефон"
          placeholder="Введите номер телефона"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isLoading}
        />

        <Select
          label="Тип оплаты"
          placeholder="Выберите тип оплаты"
          value={paymentType}
          onChange={(value) => setPaymentType(value as PaymentType | null)}
          data={[
            { value: PaymentTypeEnum.DIRECT, label: 'Прямые продажи' },
            { value: PaymentTypeEnum.CONSIGNMENT, label: 'Реализация' },
          ]}
          required
          disabled={isLoading}
        />

        {initialData && (
          <NumberInput
            label="Текущий долг"
            value={initialData.debt}
            disabled
            description="Поле только для чтения"
          />
        )}

        <Group justify="flex-start" mt="md">
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
