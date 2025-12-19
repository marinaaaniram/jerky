import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deliverySurveysAPI } from '../../../api';
import type { CreateDeliverySurveyData } from '../../../api/delivery-surveys';
import { notifications } from '@mantine/notifications';

export const useCreateDeliverySurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (surveyData: CreateDeliverySurveyData) => deliverySurveysAPI.create(surveyData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      notifications.show({
        title: 'Успех',
        message: 'Анкета доставки сохранена',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось сохранить анкету',
        color: 'red',
      });
    },
  });
};
