export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethodType {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  BOLETO = 'BOLETO'
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH'
}

export interface OrderItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface PaymentDetails {
  method: PaymentMethodType;
  installments?: number;
  creditCardNumber?: string;
  customerCpf?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  paymentMethod: PaymentMethodType;
  amountPaid: number;
  discountApplied: number;
  feeApplied: number;
  qrCode?: string; // Para Pix
  barcode?: string; // Para Boleto
  message: string;
  timestamp: Date;
}

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  status: OrderStatus;
  paymentDetails?: PaymentDetails;
  paymentResult?: PaymentResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  orderId: string;
  eventType: string;
  details: string;
  timestamp: Date;
}
