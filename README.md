# PayFlow MVP - Plataforma de Processamento de Pedidos e Checkout Financeiro

> MVP desenvolvido para a disciplina de **Arquitetura de Software** (Prof. MSc. Lucas Reis), demonstrando Arquitetura em Camadas, 3 Design Patterns do GoF, C4 Model, ADRs e Documento Formal de Defesa.

---

## 📌 Principais Recursos e Padrões Aplicados

1. **Padrão Arquitetural**: **Arquitetura em Camadas (Layered / Clean Architecture)**
   - `src/domain`: Entidades e interfaces puras.
   - `src/usecases`: Casos de uso de checkout.
   - `src/patterns`: Padrões do GoF isolados.
   - `src/infrastructure`: Repositorio em memória e logs de auditoria.
   - `src/presentation`: API REST Express e Dashboard Web.

2. **3 Design Patterns (GoF)**:
   - **Strategy Pattern** ([PaymentStrategy.ts](file:///home/josue/Documentos/arquitetura_de_software/mvp/src/patterns/strategy/PaymentStrategy.ts)): Seleção e processamento dinâmico de métodos de pagamento (Pix, Cartão de Crédito e Boleto).
   - **Factory Method Pattern** ([NotificationFactory.ts](file:///home/josue/Documentos/arquitetura_de_software/mvp/src/patterns/factory/NotificationFactory.ts)): Instanciação dinâmica de notificadores (E-mail, SMS, Push Notification).
   - **Observer Pattern** ([OrderObserver.ts](file:///home/josue/Documentos/arquitetura_de_software/mvp/src/patterns/observer/OrderObserver.ts)): Emissão e reação reativa a eventos pós-compra (atualização de estoque, notificações e logs imutáveis).

3. **Interface Visual Interativa**:
   - Web Dashboard moderno rodando em `http://localhost:3000` para simulação de checkout e visualização de logs em tempo real.

---

## 📁 Estrutura da Documentação (`/docs`)

- 📘 [Documento Oficial de Defesa (DEFESA.md)](file:///home/josue/Documentos/arquitetura_de_software/mvp/docs/DEFESA.md) - Opção B
- 📐 [Diagrama C4 Nível 1 - Contexto (c4_context.md)](file:///home/josue/Documentos/arquitetura_de_software/mvp/docs/c4_context.md)
- 📐 [Diagrama C4 Nível 2 - Container (c4_container.md)](file:///home/josue/Documentos/arquitetura_de_software/mvp/docs/c4_container.md)
- 📝 [ADR 001 - Layered Architecture](file:///home/josue/Documentos/arquitetura_de_software/mvp/docs/adr/001-layered-architecture.md)
- 📝 [ADR 002 - Strategy Pattern](file:///home/josue/Documentos/arquitetura_de_software/mvp/docs/adr/002-strategy-pattern-payments.md)
- 📝 [ADR 003 - Observer Pattern](file:///home/josue/Documentos/arquitetura_de_software/mvp/docs/adr/003-observer-pattern-events.md)

---

## 🚀 Como Executar o Projeto

```bash
# 1. Instalar dependências
npm install

# 2. Executar suíte de testes unitários e checagem de tipos
npm test
npm run typecheck

# 3. Iniciar o servidor em modo de desenvolvimento
npm run dev

# 4. Acessar a aplicação no navegador
http://localhost:3000
```
