import React from 'react';
import { Group, Title, Button, Stack, ActionIcon, Menu } from '@mantine/core';
import { IconDownload, IconFileTypePdf, IconFileTypeXls, IconRefresh } from '@tabler/icons-react';

interface ReportHeaderProps {
  title: string;
  description?: string;
  onExportPDF?: () => void;
  onExportXLSX?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  title,
  description,
  onExportPDF,
  onExportXLSX,
  onRefresh,
  isLoading = false,
}) => {
  const hasExports = onExportPDF || onExportXLSX;

  return (
    <Stack gap="sm" mb="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>{title}</Title>
          {description && <p style={{ color: '#868e96', marginTop: 4 }}>{description}</p>}
        </div>

        <Group gap="xs">
          {onRefresh && (
            <ActionIcon
              onClick={onRefresh}
              loading={isLoading}
              variant="light"
              title="Обновить"
            >
              <IconRefresh size={18} />
            </ActionIcon>
          )}

          {hasExports && (
            <Menu shadow="md" width={160}>
              <Menu.Target>
                <Button
                  leftSection={<IconDownload size={14} />}
                  variant="light"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Экспорт
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                {onExportPDF && (
                  <Menu.Item leftSection={<IconFileTypePdf size={14} />} onClick={onExportPDF}>
                    PDF
                  </Menu.Item>
                )}
                {onExportXLSX && (
                  <Menu.Item leftSection={<IconFileTypeXls size={14} />} onClick={onExportXLSX}>
                    Excel
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Group>
    </Stack>
  );
};
