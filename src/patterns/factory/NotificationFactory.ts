import { NotificationChannel } from '../../domain/entities/Order';

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  recipient: string;
  sentAt: Date;
  details: string;
}

/**
 * Interface do Produto (GoF - Factory Method Pattern)
 * Define a interface comum para todos os serviços de notificação.
 */
export interface NotificationService {
  readonly channel: NotificationChannel;
  send(recipient: string, message: string, title?: string): Promise<NotificationResult>;
}

/**
 * Produto Concreto 1: Serviço de Notificação por E-mail
 */
export class EmailNotificationService implements NotificationService {
  readonly channel = NotificationChannel.EMAIL;

  async send(recipient: string, message: string, title: string = 'Atualização do Pedido'): Promise<NotificationResult> {
    const formattedLog = `[E-MAIL] Para: ${recipient} | Assunto: ${title} | Conteúdo: "${message}"`;
    console.log(formattedLog);

    return {
      success: true,
      channel: this.channel,
      recipient,
      sentAt: new Date(),
      details: formattedLog
    };
  }
}

/**
 * Produto Concreto 2: Serviço de Notificação por SMS
 */
export class SMSNotificationService implements NotificationService {
  readonly channel = NotificationChannel.SMS;

  async send(recipient: string, message: string): Promise<NotificationResult> {
    const formattedLog = `[SMS] Para: ${recipient} | Texto: "${message}"`;
    console.log(formattedLog);

    return {
      success: true,
      channel: this.channel,
      recipient,
      sentAt: new Date(),
      details: formattedLog
    };
  }
}

/**
 * Produto Concreto 3: Serviço de Notificação por Push Notification
 */
export class PushNotificationService implements NotificationService {
  readonly channel = NotificationChannel.PUSH;

  async send(recipient: string, message: string, title: string = 'Notificação'): Promise<NotificationResult> {
    const formattedLog = `[PUSH NOTIFICATION] Para Dispositivo de: ${recipient} | Título: ${title} | Mensagem: "${message}"`;
    console.log(formattedLog);

    return {
      success: true,
      channel: this.channel,
      recipient,
      sentAt: new Date(),
      details: formattedLog
    };
  }
}

/**
 * Factory Method (GoF - Creational Pattern)
 * Responsável por instanciar a classe concreta correta com base no canal de notificação requisitado.
 * Desacopla o cliente de conhecer as implementações concretas dos notificadores.
 */
export class NotificationFactory {
  static createNotificationService(channel: NotificationChannel): NotificationService {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return new EmailNotificationService();
      case NotificationChannel.SMS:
        return new SMSNotificationService();
      case NotificationChannel.PUSH:
        return new PushNotificationService();
      default:
        throw new Error(`Canal de notificação não suportado: ${channel}`);
    }
  }
}
