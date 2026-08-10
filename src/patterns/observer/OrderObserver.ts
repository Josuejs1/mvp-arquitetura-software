import { Order, NotificationChannel, AuditLog } from '../../domain/entities/Order';
import { NotificationFactory } from '../factory/NotificationFactory';

/**
 * Interface do Observer (GoF - Behavioral Pattern)
 * Define a interface comum para todos os objetos interessados em eventos do pedido.
 */
export interface OrderObserver {
  readonly name: string;
  update(order: Order, eventType: string): Promise<void>;
}

/**
 * Subject / Publisher (GoF - Behavioral Pattern)
 * Mantém uma lista de observadores e os notifica automaticamente quando ocorrem mudanças de estado no pedido.
 */
export class OrderSubject {
  private observers: OrderObserver[] = [];

  registerObserver(observer: OrderObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
      console.log(`[Observer Pattern] Observador registrado: ${observer.name}`);
    }
  }

  removeObserver(observer: OrderObserver): void {
    this.observers = this.observers.filter(obs => obs !== observer);
    console.log(`[Observer Pattern] Observador removido: ${observer.name}`);
  }

  async notifyObservers(order: Order, eventType: string): Promise<void> {
    console.log(`[Observer Pattern] Disparando evento "${eventType}" para ${this.observers.length} observadores...`);
    for (const observer of this.observers) {
      try {
        await observer.update(order, eventType);
      } catch (error) {
        console.error(`Erro no observador ${observer.name}:`, error);
      }
    }
  }
}

/**
 * Observador Concreto 1: Gestão de Estoque
 * Reage a pagamentos aprovados e reserva/deduz itens do inventário.
 */
export class InventoryObserver implements OrderObserver {
  readonly name = 'InventoryObserver';

  async update(order: Order, eventType: string): Promise<void> {
    if (eventType === 'ORDER_PAID') {
      const itemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);
      console.log(`[INVENTÁRIO] Estoque atualizado! Reservados ${itemsCount} itens para o Pedido #${order.id}.`);
    }
  }
}

/**
 * Observador Concreto 2: Notificador de Cliente
 * Utiliza o Factory Method Pattern para instanciar o canal de notificação apropriado.
 */
export class EmailNotifierObserver implements OrderObserver {
  readonly name = 'EmailNotifierObserver';

  async update(order: Order, eventType: string): Promise<void> {
    if (eventType === 'ORDER_PAID' && order.paymentResult?.success) {
      // Uso do Factory Method Pattern aqui
      const emailService = NotificationFactory.createNotificationService(NotificationChannel.EMAIL);
      const pushService = NotificationFactory.createNotificationService(NotificationChannel.PUSH);

      await emailService.send(
        order.customer.email,
        `Seu pagamento de R$ ${order.paymentResult.amountPaid.toFixed(2)} foi aprovado via ${order.paymentResult.paymentMethod}! Transação: ${order.paymentResult.transactionId}`,
        `Comprovante do Pedido #${order.id}`
      );

      await pushService.send(
        order.customer.name,
        `Pedido #${order.id} confirmado com sucesso!`
      );
    } else if (eventType === 'ORDER_FAILED') {
      const smsService = NotificationFactory.createNotificationService(NotificationChannel.SMS);
      await smsService.send(
        order.customer.phone,
        `Atenção: Falha no pagamento do Pedido #${order.id}. Motivo: ${order.paymentResult?.message}`
      );
    }
  }
}

/**
 * Observador Concreto 3: Registro de Logs de Auditoria
 * Registra histórico imutável de eventos para compliance e observabilidade.
 */
export class AuditLoggerObserver implements OrderObserver {
  readonly name = 'AuditLoggerObserver';
  private logs: AuditLog[] = [];

  async update(order: Order, eventType: string): Promise<void> {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: order.id,
      eventType,
      details: `Status: ${order.status} | Total: R$ ${order.totalAmount.toFixed(2)} | Transação: ${order.paymentResult?.transactionId || 'N/A'}`,
      timestamp: new Date()
    };

    this.logs.push(newLog);
    console.log(`[AUDITORIA LOG] ${newLog.timestamp.toISOString()} | Evento: ${newLog.eventType} | Pedido #${newLog.orderId}`);
  }

  getLogs(): AuditLog[] {
    return [...this.logs];
  }
}
