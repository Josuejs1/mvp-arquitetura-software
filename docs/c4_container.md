# Visão Arquitetural - C4 Model: Nível 2 (Containers)

O Diagrama de Containers ilustra a arquitetura interna do **PayFlow MVP**, detalhando a divisão de responsabilidades entre a interface Web, a API de Apresentação, os Casos de Uso, os Design Patterns e o Repositório de Dados.

```mermaid
C4Container
    title Diagrama de Containers do Sistema - PayFlow MVP

    Person(customer, "Cliente", "Interage com o dashboard de checkout.")

    Container_Boundary(payflow_boundary, "PayFlow MVP (Sistema de Checkout)") {
        Container(web_ui, "Web Dashboard UI", "HTML5, CSS3 Glassmorphism, Vanilla JS", "Interface gráfica interativa onde o usuário escolhe produtos, seleciona o método de pagamento e visualiza os logs em tempo real.")
        
        Container(api_server, "Presentation Server (API REST)", "Express / Node.js", "Expõe endpoints REST (/api/checkout, /api/orders, /api/logs) e serve a aplicação frontend estática.")

        Container(usecases, "Use Cases Layer (Orquestrador)", "TypeScript Core", "CheckoutUseCase: Orquestra a execução das estratégias de pagamento e o disparo reativo dos eventos de pedido.")

        Container(patterns, "Design Patterns Layer", "TypeScript Core", "Contém as implementações puras dos padrões Strategy (Pagamentos), Factory Method (Notificações) e Observer (Eventos).")

        Container(repo, "In-Memory Repository", "TypeScript / Memory Storage", "Persistência em memória para pedidos, transações e logs imutáveis de auditoria.")
    }

    Rel_D(customer, web_ui, "Interage", "HTTP / Browser")
    Rel_D(web_ui, api_server, "Envia requisição de checkout e busca logs", "JSON / REST API")
    Rel_D(api_server, usecases, "Invoca o caso de uso", "Method Call")
    Rel_D(usecases, patterns, "Executa estratégias e notifica observadores", "Inversão de Dependência")
    Rel_D(usecases, repo, "Persiste estado e consulta pedidos", "Repository Interface")
```

## Mapeamento de Camadas e Responsabilidades

- **Presentation Layer (`web_ui` + `api_server`)**: Responsável apenas por receber HTTP e renderizar dados.
- **Use Cases Layer (`usecases`)**: Contém o `CheckoutUseCase`, garantindo que o fluxo de negócio seja independente de frameworks.
- **Design Patterns Layer (`patterns`)**: Isolamento explícito do Strategy, Factory Method e Observer.
- **Infrastructure Layer (`repo`)**: Repositório simulado em memória desacoplado via interface `OrderRepository`.
