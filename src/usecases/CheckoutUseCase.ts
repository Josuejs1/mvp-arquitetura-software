import {
  Order,
  OrderItem,
  Customer,
  PaymentDetails,
  PaymentMethodType,
  OrderStatus,
  PaymentResult
} from '../domain/entities/Order';
import {
  PaymentContext,
  PixPaymentStrategy,
  CreditCardPaymentStrategy,
  BoletoPaymentStrategy,
  PaymentStrategy
} from '../patterns/strategy/PaymentStrategy';
import {
  OrderSubject,
  InventoryObserver,
  EmailNotifierObserver,
  AuditLoggerObserver
} from '../patterns/observer/OrderObserver';
import { OrderRepository } from '../infrastructure/repositories/InMemoryOrderRepository';

export interface CheckoutInput {
  customer: Customer;
  items: OrderItem[];
  paymentDetails: PaymentDetails;
}

export interface CheckoutOutput {
  order: Order;
  paymentResult: PaymentResult;
}

/**
 * Caso de Uso: Processar Checkout Financeiro (UseCases Layer)
 * Orquestra as regras de negócio da aplicação sem acoplar a infraestrutura ou o frontend.
 * Demonstra a integração da Arquitetura em Camadas com os 3 Design Patterns.
 */
export class CheckoutUseCase {
  private paymentContext: PaymentContext;
  private orderSubject: OrderSubject;
  private auditLogger: AuditLoggerObserver;

  constructor(private orderRepository: OrderRepository) {
    this.paymentContext = new PaymentContext();
    this.orderSubject = new OrderSubject();

    // Registra os Observers no Subject
    const inventoryObserver = new InventoryObserver();
    const emailNotifierObserver = new EmailNotifierObserver();
    this.auditLogger = new AuditLoggerObserver();

    this.orderSubject.registerObserver(inventoryObserver);
    this.orderSubject.registerObserver(emailNotifierObserver);
    this.orderSubject.registerObserver(this.auditLogger);
  }

  async execute(input: CheckoutInput): Promise<CheckoutOutput> {
    if (!input.items || input.items.length === 0) {
      throw new Error('O pedido deve conter pelo menos um item.');
    }

    // 1. Cálculo de Valores no Domínio
    const subtotal = input.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

    const orderId = `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
      id: orderId,
      customer: input.customer,
      items: input.items,
      subtotal,
      totalAmount: subtotal,
      status: OrderStatus.PENDING,
      paymentDetails: input.paymentDetails,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Salva estado inicial
    await this.orderRepository.save(newOrder);

    // 2. Dispara evento de criação do pedido (Observer Pattern)
    await this.orderSubject.notifyObservers(newOrder, 'ORDER_CREATED');

    // 3. Seleção dinâmica da Estratégia de Pagamento (Strategy Pattern)
    const strategy = this.resolvePaymentStrategy(input.paymentDetails.method);
    this.paymentContext.setStrategy(strategy);

    // 4. Execução do Pagamento
    const paymentResult = await this.paymentContext.executePayment(newOrder, input.paymentDetails);

    newOrder.paymentResult = paymentResult;
    newOrder.totalAmount = paymentResult.amountPaid;

    if (paymentResult.success) {
      newOrder.status = OrderStatus.PAID;
      await this.orderRepository.save(newOrder);

      // 5. Dispara evento de pagamento efetuado (Observer Pattern -> Notificações & Estoque)
      await this.orderSubject.notifyObservers(newOrder, 'ORDER_PAID');
    } else {
      newOrder.status = OrderStatus.FAILED;
      await this.orderRepository.save(newOrder);

      // Dispara evento de falha no pagamento
      await this.orderSubject.notifyObservers(newOrder, 'ORDER_FAILED');
    }

    // Persiste logs de auditoria do observer no repositório
    for (const log of this.auditLogger.getLogs()) {
      this.orderRepository.saveLog(log);
    }

    return {
      order: newOrder,
      paymentResult
    };
  }

  /**
   * Mapeia o método de pagamento solicitado para a instância concreta da Strategy
   */
  private resolvePaymentStrategy(method: PaymentMethodType): PaymentStrategy {
    switch (method) {
      case PaymentMethodType.PIX:
        return new PixPaymentStrategy();
      case PaymentMethodType.CREDIT_CARD:
        return new CreditCardPaymentStrategy();
      case PaymentMethodType.BOLETO:
        return new BoletoPaymentStrategy();
      default:
        throw new Error(`Método de pagamento não suportado: ${method}`);
    }
  }
}
