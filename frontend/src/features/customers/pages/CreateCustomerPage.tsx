import { useNavigate } from 'react-router-dom';
import { Container, Title, Group } from '@mantine/core';
import { useCreateCustomer } from '../hooks/useCustomers';
import { CustomerForm } from '../components/CustomerForm';
import type { PaymentType } from '../../../types';

export function CreateCustomerPage() {
  const navigate = useNavigate();
  const createCustomer = useCreateCustomer();

  const handleSubmit = async (data: { name: string; address?: string; phone?: string; paymentType: PaymentType }) => {
    try {
      const customer = await createCustomer.mutateAsync(data);
      navigate(`/customers/${customer.id}`);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Создать нового клиента</Title>
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
          Отмена
        </button>
      </Group>

      <CustomerForm
        onSubmit={handleSubmit}
        isLoading={createCustomer.isPending}
        onCancel={() => navigate('/customers')}
      />
    </Container>
  );
}
