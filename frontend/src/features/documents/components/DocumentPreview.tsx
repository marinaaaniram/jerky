import React from 'react';
import { Box, Skeleton, Center, Text, Card } from '@mantine/core';
import { useDocumentPreview } from '../hooks/useDocuments';
import type { DocumentType } from '../hooks/useDocuments';

interface DocumentPreviewProps {
  orderId: number;
  documentType: DocumentType;
  height?: string | number;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  orderId,
  documentType,
  height = '600px',
}) => {
  const { data, isLoading, error } = useDocumentPreview(orderId, documentType);

  if (error) {
    return (
      <Card shadow="sm" padding="lg">
        <Center style={{ height }}>
          <Text c="red">Ошибка при загрузке документа</Text>
        </Center>
      </Card>
    );
  }

  if (isLoading) {
    return <Skeleton height={height} radius="md" />;
  }

  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Box
        style={{
          height,
          overflow: 'auto',
          fontSize: '12px',
          lineHeight: '1.6',
        }}
      >
        {data?.html && (
          <div
            dangerouslySetInnerHTML={{ __html: data.html }}
          />
        )}
      </Box>
    </Card>
  );
};
