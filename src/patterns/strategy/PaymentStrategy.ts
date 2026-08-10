import { Order, PaymentDetails, PaymentResult, PaymentMethodType } from '../../domain/entities/Order';

/**
 * Strategy Pattern Interface (GoF - Behavioral Pattern)
 * Define a família de algoritmos de pagamento de forma intercambiável e desacoplada.
 */
export interface PaymentStrategy {
  readonly method: PaymentMethodType;
  processPayment(order: Order, details: PaymentDetails): Promise<PaymentResult>;
}

/**
 * Estratégia Concreta 1: Pagamento via Pix
 * Regra: Concede 10% de desconto à vista e gera QR Code instantâneo.
 */
export class PixPaymentStrategy implements PaymentStrategy {
  readonly method = PaymentMethodType.PIX;

  async processPayment(order: Order, details: PaymentDetails): Promise<PaymentResult> {
    const discountRate = 0.10; // 10% de desconto
    const discountApplied = Number((order.subtotal * discountRate).toFixed(2));
    const amountPaid = Number((order.subtotal - discountApplied).toFixed(2));

    const randomHash = Math.random().toString(36).substring(2, 12).toUpperCase();
    const qrCode = `00020126360014BR.GOV.BCB.PIX0114+559899999999520400005303986540${amountPaid}5802BR5913MVP CHECKOUT6009SAO PAULO62070503***6304${randomHash}`;

    return {
      success: true,
      transactionId: `TX-PIX-${Date.now()}-${randomHash}`,
      paymentMethod: PaymentMethodType.PIX,
      amountPaid,
      discountApplied,
      feeApplied: 0,
      qrCode,
      message: `Pagamento Pix gerado com sucesso! Desconto de R$ ${discountApplied.toFixed(2)} (10%) aplicado.`,
      timestamp: new Date()
    };
  }
}

/**
 * Estratégia Concreta 2: Pagamento via Cartão de Crédito
 * Regra: Suporta parcelamento. Sem juros para 1x. Juros de 1.5% a.m. para 2x a 12x.
 */
export class CreditCardPaymentStrategy implements PaymentStrategy {
  readonly method = PaymentMethodType.CREDIT_CARD;

  async processPayment(order: Order, details: PaymentDetails): Promise<PaymentResult> {
    const installments = details.installments && details.installments > 0 ? details.installments : 1;
    let feeApplied = 0;

    if (installments > 1) {
      // Taxa de juros de 1.5% ao mês sobre o total
      const monthlyRate = 0.015;
      feeApplied = Number((order.subtotal * monthlyRate * installments).toFixed(2));
    }

    const amountPaid = Number((order.subtotal + feeApplied).toFixed(2));
    const installmentValue = (amountPaid / installments).toFixed(2);

    // Simulação de aprovação (cartão final 0000 simula falha para testes)
    const isDeclined = details.creditCardNumber?.endsWith('0000');

    if (isDeclined) {
      return {
        success: false,
        transactionId: `TX-CC-FAILED-${Date.now()}`,
        paymentMethod: PaymentMethodType.CREDIT_CARD,
        amountPaid: 0,
        discountApplied: 0,
        feeApplied: 0,
        message: 'Cartão de crédito recusado pela operadora. Verifique o limite ou digite um cartão válido.',
        timestamp: new Date()
      };
    }

    return {
      success: true,
      transactionId: `TX-CC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      paymentMethod: PaymentMethodType.CREDIT_CARD,
      amountPaid,
      discountApplied: 0,
      feeApplied,
      message: `Pagamento aprovado no Cartão em ${installments}x de R$ ${installmentValue}.`,
      timestamp: new Date()
    };
  }
}

/**
 * Estratégia Concreta 3: Pagamento via Boleto Bancário
 * Regra: Adiciona R$ 2,50 de taxa de emissão e gera Código de Barras com vencimento em 3 dias.
 */
export class BoletoPaymentStrategy implements PaymentStrategy {
  readonly method = PaymentMethodType.BOLETO;

  async processPayment(order: Order, details: PaymentDetails): Promise<PaymentResult> {
    const feeApplied = 2.50; // Taxa de emissão de boleto
    const amountPaid = Number((order.subtotal + feeApplied).toFixed(2));

    const barcode = `34191.79001 01043.510047 91020.150008 8 ${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    return {
      success: true,
      transactionId: `TX-BOL-${Date.now()}`,
      paymentMethod: PaymentMethodType.BOLETO,
      amountPaid,
      discountApplied: 0,
      feeApplied,
      barcode,
      message: `Boleto bancário emitido! Taxa de emissão: R$ 2,50. Vencimento em 3 dias úteis.`,
      timestamp: new Date()
    };
  }
}

/**
 * Contexto do Strategy Pattern
 * Mantém uma referência para o objeto Strategy atual e delega a execução do cálculo/pagamento.
 */
export class PaymentContext {
  private strategy?: PaymentStrategy;

  constructor(strategy?: PaymentStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  async executePayment(order: Order, details: PaymentDetails): Promise<PaymentResult> {
    if (!this.strategy) {
      throw new Error('Nenhuma estratégia de pagamento foi configurada.');
    }
    return this.strategy.processPayment(order, details);
  }
}
