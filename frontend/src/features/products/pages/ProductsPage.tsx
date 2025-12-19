import { Container, Title, Table, Button, Group, LoadingOverlay, Text, Modal } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useProducts, useDeleteProduct } from '../hooks/useProducts';

export function ProductsPage() {
  const navigate = useNavigate();
  const { data: products, isLoading, error } = useProducts();
  const deleteProduct = useDeleteProduct();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (error) {
    return (
      <Container>
        <Text c="red">Ошибка загрузки товаров: {(error as Error).message}</Text>
      </Container>
    );
  }

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteProduct.mutateAsync(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Товары</Title>
        <Button onClick={() => navigate('/products/new')}>Добавить товар</Button>
      </Group>

      <div style={{ position: 'relative', minHeight: 200 }}>
        <LoadingOverlay visible={isLoading} />

        {products && products.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>№</Table.Th>
                <Table.Th>Наименование</Table.Th>
                <Table.Th>Описание</Table.Th>
                <Table.Th>Цена</Table.Th>
                <Table.Th>На складе</Table.Th>
                <Table.Th>Действия</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {products.map((product) => (
                <Table.Tr key={product.id}>
                  <Table.Td>{product.id}</Table.Td>
                  <Table.Td>{product.name}</Table.Td>
                  <Table.Td>{product.description || '-'}</Table.Td>
                  <Table.Td>{product.price.toFixed(2)} ₽</Table.Td>
                  <Table.Td>{product.stockQuantity}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        Редактировать
                      </Button>
                      <Button
                        size="xs"
                        color="red"
                        variant="light"
                        onClick={() => handleDeleteClick(product.id)}
                      >
                        Удалить
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          !isLoading && <Text c="dimmed">Товаров пока нет</Text>
        )}
      </div>

      <Modal opened={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Подтверждение">
        <Text mb="lg">Вы уверены, что хотите удалить этот товар?</Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setShowDeleteModal(false)}>
            Отмена
          </Button>
          <Button color="red" onClick={handleConfirmDelete} loading={deleteProduct.isPending}>
            Удалить
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
