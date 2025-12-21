import apiClient from './client';

export interface SalesPeriod {
  period: string;
  revenue: number;
  orderCount: number;
  averageCheck: number;
  ordersDelivered: number;
}

export interface SalesReport {
  data: SalesPeriod[];
  totalRevenue: number;
  totalOrders: number;
  totalAverageCheck: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface TopCustomer {
  id: number;
  name: string;
  phone?: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  lastOrderDate: string;
  paymentType: 'прямые' | 'реализация';
}

export interface Debtor {
  id: number;
  name: string;
  phone?: string;
  currentDebt: number;
  lastOrderDate: string;
}

export interface TopProduct {
  id: number;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  averagePrice: number;
  currentStock: number;
}

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  quantityChange: number;
  reason: string;
  reasonText?: string;
  movementDate: string;
  userId: number;
  userName: string;
}

export interface StockLevel {
  id: number;
  name: string;
  currentStock: number;
  price: number;
  status: 'zero' | 'low' | 'normal' | 'overstocked';
}

export interface OrderStatusItem {
  status: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface OrderStatusReport {
  distribution: OrderStatusItem[];
  totalOrders: number;
  totalDelivered: number;
  totalInProgress: number;
  averageDeliveryTime?: number;
}

const analyticsAPI = {
  // Sales endpoints
  getSalesReport: async (period: string, startDate?: string, endDate?: string, page = 0, limit = 50) => {
    const { data } = await apiClient.get<SalesReport>('/analytics/sales', {
      params: { period, startDate, endDate, page, limit },
    });
    return data;
  },

  // Customer endpoints
  getTopCustomers: async (period: string, startDate?: string, endDate?: string, limit = 50) => {
    const { data } = await apiClient.get<{ data: TopCustomer[]; pagination: any }>('/analytics/customers/top', {
      params: { period, startDate, endDate, limit },
    });
    return data;
  },

  getDebtors: async (limit = 50) => {
    const { data } = await apiClient.get<{ data: Debtor[]; totalDebt: number; pagination: any }>(
      '/analytics/customers/debtors',
      {
        params: { limit },
      }
    );
    return data;
  },

  // Product endpoints
  getTopProducts: async (period: string, startDate?: string, endDate?: string, sortBy = 'quantity', limit = 50) => {
    const { data } = await apiClient.get<{ data: TopProduct[]; pagination: any }>('/analytics/products/top', {
      params: { period, startDate, endDate, sortBy, limit },
    });
    return data;
  },

  // Stock endpoints
  getStockMovements: async (period: string, startDate?: string, endDate?: string, limit = 50) => {
    const { data } = await apiClient.get<{ data: StockMovement[]; pagination: any }>('/analytics/stock/movements', {
      params: { period, startDate, endDate, limit },
    });
    return data;
  },

  getStockLevels: async (status: 'low' | 'zero' | 'overstocked' | 'all' | 'normal' = 'all') => {
    const { data } = await apiClient.get<{ data: StockLevel[]; summary: any }>('/analytics/stock/levels', {
      params: { status },
    });
    return data;
  },

  // Order status endpoints
  getOrderStatus: async (period: string, startDate?: string, endDate?: string) => {
    const { data } = await apiClient.get<OrderStatusReport>('/analytics/orders/status', {
      params: { period, startDate, endDate },
    });
    return data;
  },

  // Export endpoints
  exportSalesReport: async (format: 'pdf' | 'xlsx', period: string, startDate?: string, endDate?: string) => {
    const response = await apiClient.get('/analytics/sales/export', {
      params: { format, period, startDate, endDate },
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  exportCustomerReport: async (format: 'pdf' | 'xlsx', type: 'top' | 'debtors') => {
    const response = await apiClient.get('/analytics/customers/export', {
      params: { format, type },
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  exportProductReport: async (format: 'pdf' | 'xlsx', period: string, startDate?: string, endDate?: string) => {
    const response = await apiClient.get('/analytics/products/export', {
      params: { format, period, startDate, endDate },
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  exportStockReport: async (format: 'pdf' | 'xlsx', type: 'movements' | 'levels') => {
    const response = await apiClient.get('/analytics/stock/export', {
      params: { format, type },
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  exportOrderStatusReport: async (format: 'pdf' | 'xlsx', period: string, startDate?: string, endDate?: string) => {
    const response = await apiClient.get('/analytics/orders/export', {
      params: { format, period, startDate, endDate },
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};

export default analyticsAPI;
