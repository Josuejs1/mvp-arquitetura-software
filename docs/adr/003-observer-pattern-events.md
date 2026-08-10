# ADR 003: Aplicação do Observer Pattern para Eventos Pós-Checkout

- **Status**: Aprovado
- **Data**: 09/08/2026
- **Decisores**: Equipe de Arquitetura do MVP

---

## 1. Contexto
Após a conclusão de um pedido de checkout (ex: pagamento aprovado), diversos subsistemas precisam reagi-lo em tempo real:
1. O **estoque** precisa ser atualizado/reservado.
2. O **cliente** deve receber um e-mail de confirmação e push notification.
3. O **módulo de auditoria** precisa registrar um log imutável da transação.

Acoplar diretamente as chamadas de envio de e-mail e atualização de banco de dados dentro do caso de uso de pagamento destruiria a coesão da classe e impediria a adição de novos observadores no futuro.

---

## 2. Decisão
Decidimos aplicar o **Observer Pattern (GoF - Behavioral Pattern)** integrado ao **Factory Method Pattern**.
- Criamos a interface `OrderObserver` e a classe `OrderSubject`.
- Implementamos os observadores concretos: `InventoryObserver`, `EmailNotifierObserver` e `AuditLoggerObserver`.
- O `EmailNotifierObserver` faz uso do **Factory Method (`NotificationFactory`)** para instanciar dinamicamente os notificadores de E-mail, SMS ou Push.

---

## 3. Consequências

### Positivas
- **Desacoplamento Completo**: O `CheckoutUseCase` apenas emite o evento (`ORDER_PAID`) e desconhece quantos ou quais observadores estão inscritos.
- **Flexibilidade**: Novos observadores (ex: Módulo de Cashback, Envio de Nota Fiscal) podem ser adicionados dinamicamente apenas registrando-os no `OrderSubject`.

### Negativas / Trade-offs
- Os observadores executam em sequência síncrona na simulação; em sistemas distribuídos de alta escala, exigiria um Message Broker (RabbitMQ/Kafka).
