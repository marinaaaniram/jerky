import apiClient from './client';
import type { DeliverySurvey } from '../types';

export interface CreateDeliverySurveyData {
  orderId: number;
  qualityGood: boolean;
  packageGood: boolean;
  deliveryOnTime: boolean;
  comments?: string;
  photoUrl?: string; // base64 encoded image
}

export const deliverySurveysAPI = {
  create: async (surveyData: CreateDeliverySurveyData): Promise<DeliverySurvey> => {
    const { data } = await apiClient.post<DeliverySurvey>('/delivery-surveys', surveyData);
    return data;
  },
};
