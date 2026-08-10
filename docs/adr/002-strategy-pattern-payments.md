# ADR 002: Aplicação do Strategy Pattern para Métodos de Pagamento

- **Status**: Aprovado
- **Data**: 09/08/2026
- **Decisores**: Equipe de Arquitetura do MVP

---

## 1. Contexto
O checkout financeiro precisa suportar múltiplos métodos de pagamento (Pix, Cartão de Crédito, Boleto Bancário). Cada método possui regras de cálculo e comportamentos totalmente distintos:
- **Pix**: Desconto de 10% e geração de QR Code Pix.
- **Cartão de Crédito**: Suporte a parcelamento com cálculo de juros e simulação de autorização.
- **Boleto**: Adição de taxa de emissão de R$ 2,50 e geração de código de barras.

Se utilizássemos blocos `if/else` ou `switch/case` dentro da classe principal do pedido, violaríamos o **Princípio do Aberto/Fechado (Open/Closed Principle)** e o **Princípio da Responsabilidade Única (SRP)**.

---

## 2. Decisão
Decidimos aplicar o **Strategy Pattern (GoF - Behavioral Pattern)**. 
- Criamos a interface `PaymentStrategy`.
- Implementamos as estratégias concretas: `PixPaymentStrategy`, `CreditCardPaymentStrategy` e `BoletoPaymentStrategy`.
- Criamos a classe `PaymentContext` para permitir a troca dinâmica do algoritmo de pagamento em tempo de execução.

---

## 3. Consequências

### Positivas
- **Extensibilidade**: Para adicionar um novo meio de pagamento (ex: Crypto, PicPay), basta criar uma nova classe que implemente `PaymentStrategy` sem alterar nenhuma linha do código existente.
- **Conformidade com SOLID**: Baixo acoplamento e alta coesão em cada algoritmo de cálculo.

### Negativas / Trade-offs
- O cliente/orquestrador precisa estar ciente de qual estratégia selecionar ou delegar essa escolha para um resolver.
