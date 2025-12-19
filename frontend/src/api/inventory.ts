import apiClient from './client';
import type { StockMovement } from '../types';

export interface AdjustStockPayload {
  newQuantity: number;
  reason: 'инвентаризация' | 'коррекция' | 'уточнение' | 'приход' | 'продажа' | 'списание';
  reasonText?: string;
}

export interface CancelMovementPayload {
  reason?: string;
}

export const inventoryAPI = {
  adjustStock: async (
    productId: number,
    payload: AdjustStockPayload,
  ): Promise<StockMovement> => {
    const { data } = await apiClient.post<StockMovement>(
      `/stock-movements/adjust-stock/${productId}`,
      payload,
    );
    return data;
  },

  cancelMovement: async (
    movementId: number,
    payload: CancelMovementPayload,
  ): Promise<StockMovement> => {
    const { data } = await apiClient.post<StockMovement>(
      `/stock-movements/${movementId}/cancel`,
      payload,
    );
    return data;
  },

  getProductHistory: async (productId: number): Promise<StockMovement[]> => {
    const { data } = await apiClient.get<StockMovement[]>(
      `/stock-movements/product/${productId}/history`,
    );
    return data;
  },
};
