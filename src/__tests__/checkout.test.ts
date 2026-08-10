import { CheckoutUseCase } from '../usecases/CheckoutUseCase';
import { InMemoryOrderRepository } from '../infrastructure/repositories/InMemoryOrderRepository';
import { PaymentMethodType, OrderStatus, NotificationChannel } from '../domain/entities/Order';
import { PixPaymentStrategy, CreditCardPaymentStrategy, BoletoPaymentStrategy } from '../patterns/strategy/PaymentStrategy';
import { NotificationFactory } from '../patterns/factory/NotificationFactory';

describe('MVP Arquitetura de Software - Suíte de Testes', () => {
  let repository: InMemoryOrderRepository;
  let useCase: CheckoutUseCase;

  beforeEach(() => {
    repository = new InMemoryOrderRepository();
    useCase = new CheckoutUseCase(repository);
  });

  describe('Design Pattern 1: Strategy Pattern (Métodos de Pagamento)', () => {
    it('deve aplicar 10% de desconto para pagamentos via Pix', async () => {
      const pixStrategy = new PixPaymentStrategy();
      const mockOrder: any = { subtotal: 100 };
      const result = await pixStrategy.processPayment(mockOrder, { method: PaymentMethodType.PIX });

      expect(result.success).toBe(true);
      expect(result.discountApplied).toBe(10);
      expect(result.amountPaid).toBe(90);
      expect(result.qrCode).toBeDefined();
    });

    it('deve aplicar juros para parcelamentos no Cartão de Crédito acima de 1x', async () => {
      const ccStrategy = new CreditCardPaymentStrategy();
      const mockOrder: any = { subtotal: 1000 };
      const result = await ccStrategy.processPayment(mockOrder, {
        method: PaymentMethodType.CREDIT_CARD,
        installments: 10
      });

      expect(result.success).toBe(true);
      expect(result.feeApplied).toBeGreaterThan(0);
      expect(result.amountPaid).toBe(1150);
    });

    it('deve adicionar taxa fixa de R$ 2,50 para emissão de Boleto', async () => {
      const boletoStrategy = new BoletoPaymentStrategy();
      const mockOrder: any = { subtotal: 50 };
      const result = await boletoStrategy.processPayment(mockOrder, { method: PaymentMethodType.BOLETO });

      expect(result.success).toBe(true);
      expect(result.feeApplied).toBe(2.50);
      expect(result.amountPaid).toBe(52.50);
      expect(result.barcode).toBeDefined();
    });
  });

  describe('Design Pattern 2: Factory Method Pattern (Canais de Notificação)', () => {
    it('deve instanciar corretamente o serviço de E-mail via NotificationFactory', () => {
      const service = NotificationFactory.createNotificationService(NotificationChannel.EMAIL);
      expect(service.channel).toBe(NotificationChannel.EMAIL);
    });

    it('deve instanciar corretamente o serviço de SMS via NotificationFactory', () => {
      const service = NotificationFactory.createNotificationService(NotificationChannel.SMS);
      expect(service.channel).toBe(NotificationChannel.SMS);
    });

    it('deve instanciar corretamente o serviço de Push via NotificationFactory', () => {
      const service = NotificationFactory.createNotificationService(NotificationChannel.PUSH);
      expect(service.channel).toBe(NotificationChannel.PUSH);
    });
  });

  describe('Arquitetura em Camadas & Observer Pattern (Checkout Completo)', () => {
    it('deve processar o checkout completo via Pix e notificar observadores', async () => {
      const input = {
        customer: {
          id: 'CUST-1',
          name: 'Josué Silva',
          email: 'josue@exemplo.com',
          phone: '(98) 99999-8888'
        },
        items: [
          { id: 'PROD-1', name: 'Curso de Arquitetura de Software', unitPrice: 200, quantity: 1 },
          { id: 'PROD-2', name: 'Livro Design Patterns GoF', unitPrice: 100, quantity: 1 }
        ],
        paymentDetails: {
          method: PaymentMethodType.PIX
        }
      };

      const output = await useCase.execute(input);

      expect(output.order.status).toBe(OrderStatus.PAID);
      expect(output.paymentResult.success).toBe(true);
      expect(output.order.subtotal).toBe(300);
      expect(output.order.totalAmount).toBe(270); // 300 - 10% (30)

      const savedOrders = await repository.findAll();
      expect(savedOrders.length).toBe(1);

      const logs = repository.getLogs();
      expect(logs.length).toBeGreaterThan(0);
    });
  });
});
