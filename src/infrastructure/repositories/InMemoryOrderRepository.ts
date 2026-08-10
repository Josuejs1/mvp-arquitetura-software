import { Order, AuditLog } from '../../domain/entities/Order';

export interface OrderRepository {
  save(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  saveLog(log: AuditLog): void;
  getLogs(): AuditLog[];
}

export class InMemoryOrderRepository implements OrderRepository {
  private orders: Map<string, Order> = new Map();
  private auditLogs: AuditLog[] = [];

  async save(order: Order): Promise<Order> {
    order.updatedAt = new Date();
    this.orders.set(order.id, { ...order });
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    const order = this.orders.get(id);
    return order ? { ...order } : null;
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  saveLog(log: AuditLog): void {
    this.auditLogs.unshift(log);
  }

  getLogs(): AuditLog[] {
    return [...this.auditLogs];
  }
}
