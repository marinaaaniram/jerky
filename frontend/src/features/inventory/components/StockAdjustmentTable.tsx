import React from 'react';
import { Table, Group } from '@mantine/core';
import type { Product } from '../../../types';
import { TableActionMenu } from '../../../components/TableActionMenu';

interface StockAdjustmentTableProps {
  products: Product[];
  isLoading: boolean;
  onEditClick: (product: Product) => void;
}

export const StockAdjustmentTable: React.FC<StockAdjustmentTableProps> = ({
  products,
  isLoading,
  onEditClick,
}) => {
  const rows = products.map((product) => (
    <Table.Tr key={product.id}>
      <Table.Td>{product.id}</Table.Td>
      <Table.Td>{product.name}</Table.Td>
      <Table.Td>{product.price.toFixed(2)} ₽</Table.Td>
      <Table.Td>
        <strong>{product.stockQuantity}</strong>
      </Table.Td>
      <Table.Td>
        <Group justify="flex-end" gap="xs">
          <TableActionMenu
            actions={[
              {
                label: 'Изменить остаток',
                onClick: () => onEditClick(product),
                visible: !isLoading,
              },
            ]}
          />
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>ID</Table.Th>
          <Table.Th>Наименование</Table.Th>
          <Table.Th>Цена</Table.Th>
          <Table.Th>На складе</Table.Th>
          <Table.Th>Действие</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};
