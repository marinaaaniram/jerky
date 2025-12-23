import { useNavigate } from 'react-router-dom';
import { Container, Title, Group, Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
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
    <Container size="xl" pt={0} py={0} mt={0}>
      <Group justify="flex-start" mb="xl" mt={0} gap="xs">
        <Button variant="subtle" onClick={() => navigate('/products')} leftSection={<IconArrowLeft size={18} />}>
          Назад
        </Button>
        <Title order={2} style={{ flexGrow: 1 }}>Создать новый товар</Title>
      </Group>

      <ProductForm
        onSubmit={handleSubmit}
        isLoading={createProduct.isPending}
        onCancel={() => navigate('/products')}
      />
    </Container>
  );
}
