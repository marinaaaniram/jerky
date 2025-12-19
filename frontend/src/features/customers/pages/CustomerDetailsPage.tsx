import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Group, LoadingOverlay, Text, Button } from '@mantine/core';
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
      <Group justify="flex-start" mb="xl" gap="xs">
        <Button variant="subtle" onClick={() => navigate('/customers')}>
          Назад
        </Button>
        <Title order={2} style={{ flexGrow: 1 }}>{customer?.name || 'Загрузка...'}</Title>
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
