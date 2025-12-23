import { Container, Title, Table, Button, Group, LoadingOverlay, Text, Modal, SimpleGrid } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { useProducts, useDeleteProduct } from '../hooks/useProducts';
import { TableActionMenu } from '../../../components/TableActionMenu';
import { ProductCard } from '../components/ProductCard';

export function ProductsPage() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
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
    <Container size="xl" pt={0} py={0} mt={0}>
      <Group justify="space-between" mb="xl" mt={0}>
        <Title order={2}>Товары</Title>
        <Button onClick={() => navigate('/products/new')}>Добавить товар</Button>
      </Group>

      <div style={{ position: 'relative', minHeight: 200 }}>
        <LoadingOverlay visible={isLoading} />

        {products && products.length > 0 ? (
          isMobile ? (
            <SimpleGrid cols={1} spacing="md">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={(id) => navigate(`/products/${id}`)}
                  onDelete={handleDeleteClick}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
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
                    <Table.Td>{product.name}</Table.Td>
                    <Table.Td>{product.description || '-'}</Table.Td>
                    <Table.Td>{product.price.toFixed(2)} ₽</Table.Td>
                    <Table.Td>{product.stockQuantity}</Table.Td>
                    <Table.Td>
                      <TableActionMenu
                        actions={[
                          {
                            label: 'Редактировать',
                            onClick: () => navigate(`/products/${product.id}`),
                          },
                          {
                            label: 'Удалить',
                            onClick: () => handleDeleteClick(product.id),
                            color: 'red',
                          },
                        ]}
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )
        ) : (
          !isLoading && <Text c="dimmed">Товаров пока нет</Text>
        )}
      </div>

      <Modal opened={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Подтверждение">
        <Text mb="lg">Вы уверены, что хотите удалить этот товар?</Text>
        <Group justify="flex-start">
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
