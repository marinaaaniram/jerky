import React, { useState } from 'react';
import { Container, Title, Tabs, Card, Stack, Button, Group, Modal } from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { DocumentPreview } from '../components/DocumentPreview';
import { DocumentDownloadButton } from '../components/DocumentDownloadButton';
import type { DocumentType } from '../hooks/useDocuments';
import { IconArrowLeft } from '@tabler/icons-react';

interface DocumentTab {
  value: DocumentType;
  label: string;
  description: string;
}

const DOCUMENTS: DocumentTab[] = [
  {
    value: 'waybill',
    label: 'Накладная',
    description: 'Товарно-транспортный документ',
  },
  {
    value: 'invoice',
    label: 'Счет-фактура',
    description: 'Финансовый документ для клиента',
  },
  {
    value: 'delivery-report',
    label: 'Отчет о доставке',
    description: 'Подтверждение доставки товара',
  },
  {
    value: 'act-of-services',
    label: 'Акт выполненных работ',
    description: 'Для консигнационных клиентов',
  },
];

export const OrderDocumentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DocumentType>('waybill');
  const [previewOpen, setPreviewOpen] = useState(false);

  const orderId = id ? Number(id) : 0;

  return (
    <Container size="xl">
      <Group justify="flex-start" mb="xl" gap="xs">
        <Button
          variant="subtle"
          size="sm"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate(`/orders/${orderId}`)}
        >
          Назад к заказу
        </Button>
        <Title order={2} style={{ flexGrow: 1 }}>Документы заказа №{orderId}</Title>
      </Group>

      <Card shadow="sm" padding="lg" mb="xl">
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value as DocumentType)}>
          <Tabs.List>
            {DOCUMENTS.map((doc) => (
              <Tabs.Tab key={doc.value} value={doc.value}>
                {doc.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {DOCUMENTS.map((doc) => (
            <Tabs.Panel key={doc.value} value={doc.value} pt="lg">
              <Stack gap="lg">
                <div>
                  <Title order={4}>{doc.label}</Title>
                  <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                    {doc.description}
                  </p>
                </div>

                <Modal
                  opened={previewOpen && activeTab === doc.value}
                  onClose={() => setPreviewOpen(false)}
                  title={`Предпросмотр: ${doc.label}`}
                  size="xl"
                  fullScreen
                >
                  <DocumentPreview orderId={orderId} documentType={doc.value} />
                </Modal>

                <DocumentPreview orderId={orderId} documentType={doc.value} height="600px" />

                <DocumentDownloadButton
                  orderId={orderId}
                  documentType={doc.value}
                  onPreview={() => setPreviewOpen(true)}
                />
              </Stack>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Card>
    </Container>
  );
};
