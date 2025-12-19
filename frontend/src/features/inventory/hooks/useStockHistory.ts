import { useQuery } from '@tanstack/react-query';
import { inventoryAPI } from '../../../api/inventory';

export const useStockHistory = (productId?: number) => {
  return useQuery({
    queryKey: ['stock-history', productId],
    queryFn: () => {
      if (!productId) throw new Error('Product ID is required');
      return inventoryAPI.getProductHistory(productId);
    },
    enabled: !!productId,
  });
};
