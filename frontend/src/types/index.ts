export interface Role {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
}

export const PaymentType = {
  DIRECT: 'прямые',
  CONSIGNMENT: 'реализация',
} as const;

export type PaymentType = typeof PaymentType[keyof typeof PaymentType];

export interface Customer {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  paymentType: PaymentType;
  debt: number;
  isArchived: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  created_at: Date;
  updated_at: Date;
}

export const OrderStatus = {
  NEW: 'Новый',
  ASSEMBLING: 'В сборке',
  TRANSFERRED: 'Передан курьеру',
  DELIVERED: 'Доставлен',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customerId: number;
  customer: Customer;
  orderDate: Date;
  status: OrderStatus;
  notes?: string;
  orderItems: OrderItem[];
  deliverySurvey?: DeliverySurvey;
  created_at: Date;
  updated_at: Date;
}

export interface Payment {
  id: number;
  customerId: number;
  customer: Customer;
  amount: number;
  paymentDate: Date;
  notes?: string;
  created_at: Date;
}

export const MovementReason = {
  ARRIVAL: 'приход',
  SALE: 'продажа',
  WRITEOFF: 'списание',
  INVENTORY: 'инвентаризация',
  CORRECTION: 'коррекция',
  ADJUSTMENT: 'уточнение',
} as const;

export type MovementReason = typeof MovementReason[keyof typeof MovementReason];

export interface StockMovement {
  id: number;
  productId: number;
  product: Product;
  quantityChange: number;
  reason: MovementReason;
  reasonText?: string;
  movementDate: Date;
  userId?: number;
  user?: User;
  cancelledBy?: number;
  cancelledByUser?: User;
  isActive: boolean;
  created_at: Date;
}

export interface PriceRule {
  id: number;
  customerId: number;
  productId: number;
  customer: Customer;
  product: Product;
  specialPrice: number;
  created_at: Date;
  updated_at: Date;
}

export interface DeliverySurvey {
  id: number;
  orderId: number;
  qualityGood: boolean;
  packageGood: boolean;
  deliveryOnTime: boolean;
  photoUrl?: string;
  comments?: string;
  created_at: Date;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: number;
}
