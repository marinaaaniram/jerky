import { useNavigate } from 'react-router-dom';
import { Container, Title, Group, Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
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
    <Container size="xl" pt={0} py={0} mt={0}>
      <Group justify="flex-start" mb="xl" mt={0} gap="xs">
        <Button variant="subtle" onClick={() => navigate('/customers')} leftSection={<IconArrowLeft size={18} />}>
          Назад
        </Button>
        <Title order={2} style={{ flexGrow: 1 }}>Создать нового клиента</Title>
      </Group>

      <CustomerForm
        onSubmit={handleSubmit}
        isLoading={createCustomer.isPending}
        onCancel={() => navigate('/customers')}
      />
    </Container>
  );
}
