# Visão Arquitetural - C4 Model: Nível 1 (Contexto)

O Diagrama de Contexto descreve as fronteiras do sistema **PayFlow MVP**, seus atores (usuários/clientes) e os sistemas externos simulados com os quais se relaciona.

```mermaid
flowchart TD
    classDef person fill:#084298,stroke:#052c65,color:#ffffff,stroke-width:2px;
    classDef system fill:#0d6efd,stroke:#0a58ca,color:#ffffff,stroke-width:2px;
    classDef external fill:#495057,stroke:#343a40,color:#ffffff,stroke-width:2px;

    subgraph Atores [" Atores do Sistema "]
        customer["👤 Cliente / Comprador<br/><i>(Usuário final realizando compras e checkout)</i>"]:::person
        admin["👤 Administrador de Vendas<br/><i>(Monitoramento de pedidos e logs)</i>"]:::person
    end

    payflow["⚡ PayFlow MVP System<br/><b>Plataforma de Processamento de Pedidos & Checkout</b><br/><i>(Node.js / TypeScript - Layered Architecture)</i>"]:::system

    subgraph ExternalSystems [" Sistemas Externos (Mocked Infra) "]
        pix_net["Rede Banco Central / Pix"]:::external
        cc_acquirer["Credenciadora de Cartões"]:::external
        bank_boleto["Compensação Bancária"]:::external
        notif_gateways["Gateways de Notificação<br/><i>(SMTP / SMS / Push)</i>"]:::external
    end

    customer -->|"Realiza Pedidos & Escolhe Pagamento<br/>[HTTPS / Web Interface]"| payflow
    admin -->|"Visualiza Histórico & Logs Reativos<br/>[HTTPS / Dashboard]"| payflow

    payflow -->|"Gera Chave e Consulta Liquidação<br/>[API REST / Strategy Pattern]"| pix_net
    payflow -->|"Solicita Autorização & Parcelamento<br/>[API REST / Strategy Pattern]"| cc_acquirer
    payflow -->|"Emite Título e Registro de Boleto<br/>[API REST / Strategy Pattern]"| bank_boleto
    payflow -->|"Despacha Notificações Pós-Checkout<br/>[Factory Method & Observer]"| notif_gateways
```

## Descrição dos Componentes e Atores

1. **Cliente / Comprador**: Acessa a interface web interativa do MVP, escolhe os produtos, fornece dados cadastrais e escolhe o método de pagamento.
2. **PayFlow MVP System**: O núcleo da aplicação desenvolvida em **Node.js/TypeScript** organizando as regras de negócio em camadas desacopladas.
3. **Sistemas Externos (Mocked Infra)**: Simulação dos provedores financeiros e de notificação integrados via os padrões **Strategy**, **Factory Method** e **Observer**.
