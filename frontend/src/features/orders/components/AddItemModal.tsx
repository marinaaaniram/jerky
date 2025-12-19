import { Modal, Select, NumberInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAddOrderItem } from '../hooks/useOrders';
import { useProducts } from '../../products/hooks/useProducts';

interface AddItemModalProps {
  opened: boolean;
  onClose: () => void;
  orderId: number;
}

export function AddItemModal({ opened, onClose, orderId }: AddItemModalProps) {
  const { data: products, isLoading: productsLoading } = useProducts();
  const addItem = useAddOrderItem();

  const form = useForm({
    initialValues: {
      productId: '',
      quantity: 1,
    },
    validate: {
      productId: (value) => (!value ? 'Выберите товар' : null),
      quantity: (value) => (value < 1 ? 'Количество должно быть больше 0' : null),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    addItem.mutate(
      {
        orderId,
        itemData: {
          productId: Number(values.productId),
          quantity: values.quantity,
        },
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  });

  const productOptions = products?.map((product) => ({
    value: String(product.id),
    label: `${product.name} (${product.price} ₽, на складе: ${product.stockQuantity})`,
  })) || [];

  return (
    <Modal opened={opened} onClose={onClose} title="Добавить товар в заказ">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Select
            label="Товар"
            placeholder="Выберите товар"
            data={productOptions}
            searchable
            disabled={productsLoading}
            {...form.getInputProps('productId')}
          />

          <NumberInput
            label="Количество"
            placeholder="Введите количество"
            min={1}
            {...form.getInputProps('quantity')}
          />

          <Button type="submit" loading={addItem.isPending} fullWidth>
            Добавить
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
