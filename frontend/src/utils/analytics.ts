import type { Order, Product, Customer, OrderStatus } from '../types';
import { OrderStatus as OrderStatusEnum } from '../types';

/**
 * Calculate total revenue from delivered orders only
 */
export const calculateTotalRevenue = (orders: Order[]): number => {
  if (!orders) return 0;
  return orders
    .filter((order) => order.status === OrderStatusEnum.DELIVERED)
    .reduce((sum, order) => {
      const orderTotal = order.orderItems.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0);
      return sum + orderTotal;
    }, 0);
};

/**
 * Calculate total debt from consignment customers
 */
export const calculateConsignmentDebt = (customers: Customer[]): number => {
  if (!customers) return 0;
  return customers
    .filter((customer) => customer.paymentType === 'реализация')
    .reduce((sum, customer) => sum + customer.debt, 0);
};

/**
 * Calculate average order value from delivered orders only
 */
export const calculateAverageOrderValue = (orders: Order[]): number => {
  if (!orders || orders.length === 0) return 0;
  const deliveredOrders = orders.filter((order) => order.status === OrderStatusEnum.DELIVERED);
  if (deliveredOrders.length === 0) return 0;
  const revenue = calculateTotalRevenue(orders);
  return revenue / deliveredOrders.length;
};

/**
 * Get count of orders by status
 */
export const getOrdersByStatus = (orders: Order[]): Record<string, number> => {
  if (!orders) return {};

  const statusCounts: Record<string, number> = {
    'Новый': 0,
    'В сборке': 0,
    'Передан курьеру': 0,
    'Доставлен': 0,
  };

  orders.forEach((order) => {
    if (order.status in statusCounts) {
      statusCounts[order.status]++;
    }
  });

  return statusCounts;
};

/**
 * Get products with low stock (below threshold)
 */
export const getLowStockProducts = (products: Product[], threshold: number = 20): Product[] => {
  if (!products) return [];
  return products.filter((product) => product.stockQuantity < threshold).sort((a, b) => a.stockQuantity - b.stockQuantity);
};

/**
 * Get top selling products by quantity ordered
 */
export const getTopSellingProducts = (orders: Order[], limit: number = 5): Array<{ product: Omit<Product, 'created_at' | 'updated_at'>; quantity: number; revenue: number }> => {
  if (!orders) return [];

  const productMap = new Map<number, { product: Omit<Product, 'created_at' | 'updated_at'>; quantity: number; revenue: number }>();

  orders.forEach((order) => {
    order.orderItems.forEach((item) => {
      const key = item.productId;
      if (productMap.has(key)) {
        const existing = productMap.get(key)!;
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        productMap.set(key, {
          product: {
            id: item.productId,
            name: item.productId.toString(),
            price: item.price,
            stockQuantity: 0,
            description: '',
          },
          quantity: item.quantity,
          revenue: item.price * item.quantity,
        });
      }
    });
  });

  return Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
};

/**
 * Format currency for display
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Get status label in Russian
 */
export const getStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    'Новый': 'Новый',
    'В сборке': 'В сборке',
    'Передан курьеру': 'Передан курьеру',
    'Доставлен': 'Доставлен',
  };
  return labels[status] || status;
};

/**
 * Get status color for visualization
 */
export const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    'Новый': 'gray',
    'В сборке': 'yellow',
    'Передан курьеру': 'orange',
    'Доставлен': 'green',
  };
  return colors[status] || 'gray';
};
