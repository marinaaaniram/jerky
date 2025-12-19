import { useNavigate } from 'react-router-dom';
import { Container, Title, Group } from '@mantine/core';
import { useCreateProduct } from '../hooks/useProducts';
import { ProductForm } from '../components/ProductForm';

export function CreateProductPage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();

  const handleSubmit = async (data: { name: string; description?: string; price: number; stockQuantity?: number }) => {
    try {
      const product = await createProduct.mutateAsync(data);
      navigate(`/products/${product.id}`);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Создать новый товар</Title>
        <button
          onClick={() => navigate('/products')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            padding: 0,
          }}
        >
          Отмена
        </button>
      </Group>

      <ProductForm
        onSubmit={handleSubmit}
        isLoading={createProduct.isPending}
        onCancel={() => navigate('/products')}
      />
    </Container>
  );
}
