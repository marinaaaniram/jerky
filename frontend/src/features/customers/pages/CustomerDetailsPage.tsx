import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Group, LoadingOverlay, Text } from '@mantine/core';
import { useCustomer, useUpdateCustomer } from '../hooks/useCustomers';
import { CustomerForm } from '../components/CustomerForm';
import type { PaymentType } from '../../../types';

export function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customerId = id ? Number(id) : 0;

  const { data: customer, isLoading: isLoadingCustomer, error } = useCustomer(customerId);
  const updateCustomer = useUpdateCustomer();

  if (error) {
    return (
      <Container>
        <Text c="red">Ошибка загрузки клиента: {(error as Error).message}</Text>
      </Container>
    );
  }

  const handleSubmit = async (data: { name: string; address?: string; phone?: string; paymentType: PaymentType }) => {
    try {
      await updateCustomer.mutateAsync({
        id: customerId,
        data,
      });
      navigate('/customers');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>{customer?.name || 'Загрузка...'}</Title>
        <button
          onClick={() => navigate('/customers')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            padding: 0,
          }}
        >
          Назад
        </button>
      </Group>

      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={isLoadingCustomer} />
        {customer && (
          <CustomerForm
            initialData={customer}
            onSubmit={handleSubmit}
            isLoading={updateCustomer.isPending}
            onCancel={() => navigate('/customers')}
          />
        )}
      </div>
    </Container>
  );
}
