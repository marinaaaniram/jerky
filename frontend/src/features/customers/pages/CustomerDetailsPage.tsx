import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Group, LoadingOverlay, Text, Button, Tabs, Stack } from '@mantine/core';
import { IconArrowLeft, IconMessage, IconHistory } from '@tabler/icons-react';
import { useCustomer, useUpdateCustomer } from '../hooks/useCustomers';
import { CustomerForm } from '../components/CustomerForm';
import { CustomerCommentsPanel } from '../components/CustomerCommentsPanel';
import { CustomerInteractionTimeline } from '../components/CustomerInteractionTimeline';
import type { PaymentType } from '../../../types';

export function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string | null>('details');
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
    <Container size="xl" pt={0} py={0} mt={0}>
      <Group justify="flex-start" mb="xl" mt={0} gap="xs">
        <Button variant="subtle" onClick={() => navigate('/customers')} leftSection={<IconArrowLeft size={18} />}>
          Назад
        </Button>
        <Title order={2} style={{ flexGrow: 1 }}>{customer?.name || 'Загрузка...'}</Title>
      </Group>

      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={isLoadingCustomer} />
        {customer && (
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="details">Сведения</Tabs.Tab>
              <Tabs.Tab value="comments" leftSection={<IconMessage size={14} />}>Комментарии</Tabs.Tab>
              <Tabs.Tab value="history" leftSection={<IconHistory size={14} />}>История</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="details" pt="md">
              <CustomerForm
                initialData={customer}
                onSubmit={handleSubmit}
                isLoading={updateCustomer.isPending}
                onCancel={() => navigate('/customers')}
              />
            </Tabs.Panel>

            <Tabs.Panel value="comments" pt="md">
              <Stack>
                <Text fw={600} size="lg">Комментарии к клиенту</Text>
                <CustomerCommentsPanel customerId={customerId} />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="history" pt="md">
              <Stack>
                <Text fw={600} size="lg">История взаимодействий</Text>
                <CustomerInteractionTimeline customerId={customerId} />
              </Stack>
            </Tabs.Panel>
          </Tabs>
        )}
      </div>
    </Container>
  );
}
