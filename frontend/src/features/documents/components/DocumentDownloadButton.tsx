import React, { useState } from 'react';
import { Button, Stack } from '@mantine/core';
import { IconDownload, IconPrinter, IconFileText } from '@tabler/icons-react';
import { useDownloadDocument } from '../hooks/useDocuments';
import type { DocumentType } from '../hooks/useDocuments';

interface DocumentDownloadButtonProps {
  orderId: number;
  documentType: DocumentType;
  onPreview?: () => void;
}

export const DocumentDownloadButton: React.FC<DocumentDownloadButtonProps> = ({
  orderId,
  documentType,
  onPreview,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const downloadDocument = useDownloadDocument();

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await downloadDocument(orderId, documentType, `${documentType}_${orderId}.pdf`);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack gap="sm" w="100%">
      {onPreview && (
        <Button
          fullWidth
          leftSection={<IconFileText size={16} />}
          onClick={onPreview}
        >
          Предпросмотр
        </Button>
      )}
      <Button
        fullWidth
        variant="light"
        leftSection={<IconDownload size={16} />}
        onClick={handleDownload}
        loading={isLoading}
      >
        Скачать PDF
      </Button>
      <Button
        fullWidth
        variant="light"
        leftSection={<IconPrinter size={16} />}
        onClick={() => window.print()}
      >
        Печать
      </Button>
    </Stack>
  );
};
