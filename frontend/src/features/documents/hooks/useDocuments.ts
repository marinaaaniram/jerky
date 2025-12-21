import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/client';

export type DocumentType = 'waybill' | 'invoice' | 'delivery-report' | 'act-of-services';
export type DocumentFormat = 'html' | 'pdf';

interface DocumentResponse {
  html: string;
}

export const useDocument = (
  orderId: number,
  documentType: DocumentType,
  format: DocumentFormat = 'html',
) => {
  return useQuery({
    queryKey: ['document', orderId, documentType, format],
    queryFn: async () => {
      const response = await apiClient.get<DocumentResponse>(
        `/documents/orders/${orderId}/${documentType}/${format}`,
      );
      return response.data;
    },
    enabled: !!orderId,
  });
};

export const useDownloadDocument = () => {
  return async (orderId: number, documentType: DocumentType, filename?: string) => {
    try {
      const response = await apiClient.get(
        `/documents/orders/${orderId}/${documentType}/pdf`,
        {
          responseType: 'blob',
        },
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${documentType}_${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download document:', error);
      throw error;
    }
  };
};

export const useDocumentPreview = (
  orderId: number,
  documentType: DocumentType,
) => {
  return useQuery({
    queryKey: ['document-preview', orderId, documentType],
    queryFn: async () => {
      const response = await apiClient.get<DocumentResponse>(
        `/documents/orders/${orderId}/${documentType}/html`,
      );
      return response.data;
    },
    enabled: !!orderId,
  });
};
