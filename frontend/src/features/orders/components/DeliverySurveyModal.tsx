import { useState } from 'react';
import { Modal, Checkbox, Textarea, Button, Stack, FileInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateDeliverySurvey } from '../../delivery-surveys/hooks/useDeliverySurveys';

interface DeliverySurveyModalProps {
  opened: boolean;
  onClose: () => void;
  orderId: number;
  onSuccess: () => void;
}

export function DeliverySurveyModal({ opened, onClose, orderId, onSuccess }: DeliverySurveyModalProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const createSurvey = useCreateDeliverySurvey();

  const form = useForm({
    initialValues: {
      qualityGood: true,
      packageGood: true,
      deliveryOnTime: true,
      comments: '',
    },
  });

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = form.onSubmit((values) => {
    createSurvey.mutate(
      {
        orderId,
        qualityGood: values.qualityGood,
        packageGood: values.packageGood,
        deliveryOnTime: values.deliveryOnTime,
        comments: values.comments || undefined,
        photoUrl: photoPreview || undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          setPhotoFile(null);
          setPhotoPreview(null);
          onSuccess();
        },
      }
    );
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Анкета доставки" size="md">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Checkbox
            label="Качество товара хорошее"
            {...form.getInputProps('qualityGood', { type: 'checkbox' })}
          />

          <Checkbox
            label="Упаковка в хорошем состоянии"
            {...form.getInputProps('packageGood', { type: 'checkbox' })}
          />

          <Checkbox
            label="Доставка вовремя"
            {...form.getInputProps('deliveryOnTime', { type: 'checkbox' })}
          />

          <Textarea
            label="Комментарии"
            placeholder="Дополнительные комментарии о доставке"
            rows={3}
            {...form.getInputProps('comments')}
          />

          <FileInput
            label="Фото доставки"
            placeholder="Выберите фото"
            accept="image/*"
            value={photoFile}
            onChange={handlePhotoChange}
          />

          {photoPreview && (
            <div>
              <Text size="sm" fw={500} mb="xs">
                Предпросмотр:
              </Text>
              <img
                src={photoPreview}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
              />
            </div>
          )}

          <Button type="submit" loading={createSurvey.isPending} fullWidth>
            Сохранить анкету
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
