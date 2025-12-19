import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Group, LoadingOverlay, Text, Button } from '@mantine/core';
import { useProduct, useUpdateProduct } from '../hooks/useProducts';
import { ProductForm } from '../components/ProductForm';

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = id ? Number(id) : 0;

  const { data: product, isLoading: isLoadingProduct, error } = useProduct(productId);
  const updateProduct = useUpdateProduct();

  if (error) {
    return (
      <Container>
        <Text c="red">Ошибка загрузки товара: {(error as Error).message}</Text>
      </Container>
    );
  }

  const handleSubmit = async (data: { name: string; description?: string; price: number; stockQuantity?: number }) => {
    try {
      await updateProduct.mutateAsync({
        id: productId,
        data,
      });
      navigate('/products');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Container size="xl">
      <Group justify="flex-start" mb="xl" gap="xs">
        <Button variant="subtle" onClick={() => navigate('/products')}>
          Назад
        </Button>
        <Title order={2} style={{ flexGrow: 1 }}>{product?.name || 'Загрузка...'}</Title>
      </Group>

      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={isLoadingProduct} />
        {product && (
          <ProductForm
            initialData={product}
            onSubmit={handleSubmit}
            isLoading={updateProduct.isPending}
            onCancel={() => navigate('/products')}
          />
        )}
      </div>
    </Container>
  );
}
