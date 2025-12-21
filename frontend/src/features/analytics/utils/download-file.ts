export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getFileExtension = (format: 'pdf' | 'xlsx'): string => {
  return format === 'pdf' ? 'pdf' : 'xlsx';
};

export const formatExportFilename = (reportName: string, format: 'pdf' | 'xlsx'): string => {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `${reportName}_${timestamp}.${getFileExtension(format)}`;
};
