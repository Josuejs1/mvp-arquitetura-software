# Visão Arquitetural - C4 Model: Nível 2 (Containers)

O Diagrama de Containers ilustra a arquitetura interna do **PayFlow MVP**, detalhando a divisão de responsabilidades entre a interface Web, a API de Apresentação, os Casos de Uso, os Design Patterns e o Repositório de Dados.

```mermaid
flowchart TD
    classDef person fill:#084298,stroke:#052c65,color:#ffffff,stroke-width:2px;
    classDef container fill:#0d6efd,stroke:#0a58ca,color:#ffffff,stroke-width:2px;
    classDef core fill:#0b5ed7,stroke:#0a58ca,color:#ffffff,stroke-width:2px;
    classDef repo fill:#198754,stroke:#146c43,color:#ffffff,stroke-width:2px;

    customer["👤 Cliente / Comprador<br/><i>(Interage com o dashboard de checkout)</i>"]:::person

    subgraph Boundary [" PayFlow MVP (Sistema de Checkout) "]
        direction TD
        
        web_ui["🖥️ Web Dashboard UI<br/><b>[HTML5 / CSS3 Glassmorphism / Vanilla JS]</b><br/><i>Interface gráfica interativa de checkout e logs em tempo real</i>"]:::container
        
        api_server["⚙️ Presentation Server (API REST)<br/><b>[Express / Node.js]</b><br/><i>Endpoints REST (/api/checkout, /api/orders, /api/logs)</i>"]:::container
        
        usecases["🧩 Use Cases Layer (Orquestrador)<br/><b>[CheckoutUseCase]</b><br/><i>Orquestra execuções de pagamentos e disparo reativo de eventos</i>"]:::core
        
        patterns["🧱 Design Patterns Layer<br/><b>[TypeScript Core]</b><br/><i>Implementações puras de Strategy, Factory Method e Observer</i>"]:::core
        
        repo["💾 In-Memory Repository<br/><b>[TypeScript Storage]</b><br/><i>Persistência em memória de pedidos, transações e logs imutáveis</i>"]:::repo
    end

    customer -->|"1. Interage via Navegador<br/>[HTTP / Browser]"| web_ui
    web_ui -->|"2. Envia Requisição de Checkout & Logs<br/>[JSON / REST API]"| api_server
    api_server -->|"3. Invoca o Caso de Uso<br/>[CheckoutUseCase]"| usecases
    usecases -->|"4. Executa Estratégias & Notifica Observers<br/>[Inversão de Dependência]"| patterns
    usecases -->|"5. Persiste Estado & Consulta Pedidos<br/>[Repository Interface]"| repo
```

## Mapeamento de Camadas e Responsabilidades

- **Presentation Layer (`web_ui` + `api_server`)**: Responsável apenas por receber HTTP e renderizar dados.
- **Use Cases Layer (`usecases`)**: Contém o `CheckoutUseCase`, garantindo que o fluxo de negócio seja independente de frameworks.
- **Design Patterns Layer (`patterns`)**: Isolamento explícito do Strategy, Factory Method e Observer.
- **Infrastructure Layer (`repo`)**: Repositório simulado em memória desacoplado via interface `OrderRepository`.
