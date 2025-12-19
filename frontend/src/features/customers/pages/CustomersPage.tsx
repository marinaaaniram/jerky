import { Container, Title, Table, Button, Group, LoadingOverlay, Text, Modal, Checkbox, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCustomers, useArchiveCustomer } from '../hooks/useCustomers';
import { PaymentType } from '../../../types';

export function CustomersPage() {
  const navigate = useNavigate();
  const { data: customers, isLoading, error } = useCustomers();
  const archiveCustomer = useArchiveCustomer();
  const [archiveId, setArchiveId] = useState<number | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  if (error) {
    return (
      <Container>
        <Text c="red">Ошибка загрузки клиентов: {(error as Error).message}</Text>
      </Container>
    );
  }

  const filteredCustomers = customers?.filter((customer) => showArchived || !customer.isArchived) || [];

  const handleArchiveClick = (id: number) => {
    setArchiveId(id);
    setShowArchiveModal(true);
  };

  const handleConfirmArchive = async () => {
    if (archiveId) {
      await archiveCustomer.mutateAsync(archiveId);
      setShowArchiveModal(false);
      setArchiveId(null);
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    return type === PaymentType.DIRECT ? 'Прямые' : 'Реализация';
  };

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Клиенты</Title>
        <Button onClick={() => navigate('/customers/new')}>Добавить клиента</Button>
      </Group>

      <Stack gap="md" mb="md">
        <Checkbox
          label="Показать архивированные"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.currentTarget.checked)}
        />
      </Stack>

      <div style={{ position: 'relative', minHeight: 200 }}>
        <LoadingOverlay visible={isLoading} />

        {filteredCustomers && filteredCustomers.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>№</Table.Th>
                <Table.Th>Наименование</Table.Th>
                <Table.Th>Телефон</Table.Th>
                <Table.Th>Тип оплаты</Table.Th>
                <Table.Th>Долг</Table.Th>
                <Table.Th>Действия</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredCustomers.map((customer) => (
                <Table.Tr key={customer.id}>
                  <Table.Td>{customer.id}</Table.Td>
                  <Table.Td>{customer.name}</Table.Td>
                  <Table.Td>{customer.phone || '-'}</Table.Td>
                  <Table.Td>{getPaymentTypeLabel(customer.paymentType)}</Table.Td>
                  <Table.Td>{customer.debt.toFixed(2)} ₽</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                      >
                        Редактировать
                      </Button>
                      {!customer.isArchived && (
                        <Button
                          size="xs"
                          color="orange"
                          variant="light"
                          onClick={() => handleArchiveClick(customer.id)}
                        >
                          Архивировать
                        </Button>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          !isLoading && <Text c="dimmed">Клиентов пока нет</Text>
        )}
      </div>

      <Modal opened={showArchiveModal} onClose={() => setShowArchiveModal(false)} title="Подтверждение">
        <Text mb="lg">Вы уверены, что хотите архивировать этого клиента?</Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setShowArchiveModal(false)}>
            Отмена
          </Button>
          <Button color="orange" onClick={handleConfirmArchive} loading={archiveCustomer.isPending}>
            Архивировать
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
