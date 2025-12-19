import React, { useState } from 'react';
import { Modal, Button, Group, Stack, NumberInput, Select, Textarea, Text, Loader, Center } from '@mantine/core';
import type { Product } from '../../../types';
import { useStockAdjustment } from '../hooks/useStockAdjustment';
import { useStockHistory } from '../hooks/useStockHistory';

interface AdjustmentModalProps {
  product: Product | null;
  opened: boolean;
  onClose: () => void;
}

export const AdjustmentModal: React.FC<AdjustmentModalProps> = ({
  product,
  opened,
  onClose,
}) => {
  const [newQuantity, setNewQuantity] = useState<number | string>(product?.stockQuantity || '');
  const [reason, setReason] = useState<string>('инвентаризация');
  const [reasonText, setReasonText] = useState('');
  const { mutate: adjustStock, isPending } = useStockAdjustment();
  const { data: history } = useStockHistory(product?.id);

  const handleSubmit = () => {
    if (product && newQuantity !== '' && typeof newQuantity === 'number') {
      adjustStock(
        {
          productId: product.id,
          payload: {
            newQuantity,
            reason: reason as 'инвентаризация' | 'коррекция' | 'уточнение' | 'приход' | 'продажа' | 'списание',
            reasonText,
          },
        },
        {
          onSuccess: () => {
            handleClose();
          },
        },
      );
    }
  };

  const handleClose = () => {
    setNewQuantity(product?.stockQuantity || '');
    setReason('инвентаризация');
    setReasonText('');
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Изменить остаток товара" size="lg">
      {product ? (
        <Stack gap="md">
          <div>
            <Text fw={500}>{product.name}</Text>
            <Text size="sm" c="dimmed">
              Текущий остаток: {product.stockQuantity}
            </Text>
          </div>

          <NumberInput
            label="Новый остаток"
            placeholder="Введите новое количество"
            value={newQuantity}
            onChange={setNewQuantity}
            min={0}
            required
            disabled={isPending}
          />

          <Select
            label="Причина"
            placeholder="Выберите причину"
            value={reason}
            onChange={(val) => setReason(val || 'инвентаризация')}
            data={[
              { value: 'инвентаризация', label: 'Инвентаризация' },
              { value: 'коррекция', label: 'Коррекция' },
              { value: 'уточнение', label: 'Уточнение' },
            ]}
            disabled={isPending}
          />

          <Textarea
            label="Примечание"
            placeholder="Дополнительная информация (опционально)"
            value={reasonText}
            onChange={(e) => setReasonText(e.currentTarget.value)}
            rows={3}
            disabled={isPending}
          />

          {/* История последних изменений */}
          {history && history.length > 0 && (
            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
              <Text fw={500} size="sm" mb="xs">
                История последних изменений (последние 5)
              </Text>
              <Stack gap="xs" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {history.slice(0, 5).map((move) => (
                  <div key={move.id} style={{ fontSize: '0.875rem', padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <div>
                      <strong>
                        {move.quantityChange > 0 ? '+' : ''}
                        {move.quantityChange}
                      </strong>{' '}
                      ({move.reason}) {move.isActive ? '' : '❌ отменено'}
                    </div>
                    {move.reasonText && <div style={{ color: '#666' }}>{move.reasonText}</div>}
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>
                      {move.user?.firstName} {move.user?.lastName} • {new Date(move.created_at).toLocaleString('ru-RU')}
                    </div>
                  </div>
                ))}
              </Stack>
            </div>
          )}

          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={handleClose} disabled={isPending}>
              Отменить
            </Button>
            <Button onClick={handleSubmit} loading={isPending}>
              Сохранить
            </Button>
          </Group>
        </Stack>
      ) : (
        <Center>
          <Loader />
        </Center>
      )}
    </Modal>
  );
};
