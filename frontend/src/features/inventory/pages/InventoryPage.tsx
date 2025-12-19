import React, { useState } from 'react';
import { Container, Title, Loader, Stack, Text } from '@mantine/core';
import { useProducts } from '../../products/hooks/useProducts';
import { StockAdjustmentTable } from '../components/StockAdjustmentTable';
import { AdjustmentModal } from '../components/AdjustmentModal';
import type { Product } from '../../../types';

export const InventoryPage: React.FC = () => {
  const { data: products = [], isLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setModalOpened(true);
  };

  const handleModalClose = () => {
    setModalOpened(false);
    setSelectedProduct(null);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>Инвентаризация остатков</Title>
          <Text c="dimmed" size="sm" mt="xs">
            Управление остатками товаров на складе с полной историей изменений
          </Text>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <Loader />
          </div>
        ) : products.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <Text c="dimmed">Нет товаров в системе</Text>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <StockAdjustmentTable
              products={products}
              isLoading={isLoading}
              onEditClick={handleEditClick}
            />
          </div>
        )}
      </Stack>

      <AdjustmentModal
        product={selectedProduct}
        opened={modalOpened}
        onClose={handleModalClose}
      />
    </Container>
  );
};
