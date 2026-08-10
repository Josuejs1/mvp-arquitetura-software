# Visão Arquitetural - C4 Model: Nível 1 (Contexto)

O Diagrama de Contexto descreve as fronteiras do sistema **PayFlow MVP**, seus atores (usuários/clientes) e os sistemas externos simulados com os quais se relaciona.

```mermaid
C4Context
    title Diagrama de Contexto do Sistema - PayFlow MVP (Checkout Financeiro)

    Person(customer, "Cliente / Comprador", "Usuário final realizando compras e efetuando pagamento online.")
    Person(admin, "Administrador de Vendas", "Profissional que monitora pedidos, logs de auditoria e métricas.")

    System(payflow, "PayFlow MVP System", "Plataforma de Processamento de Pedidos e Checkout Financeiro desenvolvida em Arquitetura em Camadas.")

    System_Ext(pix_net, "Rede Banco Central / Pix", "Sistema de liquidação e geração de QR Codes Pix.")
    System_Ext(cc_acquirer, "Credenciadora de Cartões", "Processadora externa para autorização e parcelamento de cartão.")
    System_Ext(bank_boleto, "Sistema de Compensação Bancária", "Emissor e validador de códigos de barras para boletos.")
    System_Ext(notif_gateways, "Gateways de Notificação (SMTP/SMS/Push)", "Provedores externos para envio de e-mails, SMS e notificações push.")

    Rel(customer, payflow, "Realiza pedidos e seleciona a estratégia de pagamento", "HTTPS / Web Interface")
    Rel(admin, payflow, "Visualiza histórico de pedidos e logs de auditoria reativos", "HTTPS / Dashboard")

    Rel(payflow, pix_net, "Gera chave e consulta liquidação Pix", "API REST / Strategy Pattern")
    Rel(payflow, cc_acquirer, "Solicita autorização e parcelamento de transação", "API REST / Strategy Pattern")
    Rel(payflow, bank_boleto, "Emite título e registro de boleto bancário", "API REST / Strategy Pattern")
    Rel(payflow, notif_gateways, "Despacha notificações pós-checkout", "SMTP/HTTPS / Factory Method & Observer")
```

## Descrição dos Componentes e Atores

1. **Cliente / Comprador**: Acessa a interface web interativa do MVP, escolhe os produtos, fornece dados cadastrais e escolhe o método de pagamento.
2. **PayFlow MVP System**: O núcleo da aplicação desenvolvida em **Node.js/TypeScript** organizando as regras de negócio em camadas desacopladas.
3. **Sistemas Externos (Mocked Infra)**: Simulação dos provedores financeiros e de notificação integrados via os padrões **Strategy**, **Factory Method** e **Observer**.
