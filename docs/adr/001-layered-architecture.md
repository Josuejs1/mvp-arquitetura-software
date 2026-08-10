# ADR 001: Adoção da Arquitetura em Camadas (Layered / Clean Architecture)

- **Status**: Aprovado
- **Data**: 09/08/2026
- **Decisores**: Equipe de Arquitetura do MVP

---

## 1. Contexto
O sistema **PayFlow MVP** necessita de uma estrutura clara onde as regras de negócio de checkout financeiro fiquem completamente isoladas de detalhes de infraestrutura (banco de dados, frameworks HTTP) e da interface visual. O projeto será avaliado pelos critérios de **alta coesão, baixo acoplamento e separação estrita de responsabilidades**.

---

## 2. Decisão
Decidimos adotar o padrão **Arquitetura em Camadas (Layered Architecture / Clean Architecture)** dividido nas seguintes camadas dentro do diretório `src/`:

1. **`domain/`**: Entidades centrais (`Order`, `PaymentResult`, `Customer`) e contratos de interfaces puras.
2. **`usecases/`**: Orquestração dos fluxos de trabalho da aplicação (`CheckoutUseCase`).
3. **`patterns/`**: Módulos isolados com as implementações formais dos Design Patterns do GoF.
4. **`infrastructure/`**: Persistência de dados (`InMemoryOrderRepository`) e simulação de serviços externos.
5. **`presentation/`**: Servidor de API REST (`Express`) e entrega do Dashboard Web.

---

## 3. Consequências

### Positivas
- **Independência Tecnológica**: A regra de negócio não depende do Express nem de um banco de dados específico.
- **Facilidade de Testes Unitários**: O `CheckoutUseCase` pode ser testado isoladamente sem precisar subir o servidor HTTP.
- **Manutenibilidade**: Mudanças no frontend ou na infraestrutura de dados não afetam as regras de pagamento.

### Negativas / Trade-offs
- Aumento no número inicial de arquivos e interfaces (complexidade estrutural justificável pelo desacoplamento).
