import express from 'express';
import path from 'path';
import { InMemoryOrderRepository } from '../infrastructure/repositories/InMemoryOrderRepository';
import { CheckoutUseCase } from '../usecases/CheckoutUseCase';
import { PaymentMethodType } from '../domain/entities/Order';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

const orderRepository = new InMemoryOrderRepository();
const checkoutUseCase = new CheckoutUseCase(orderRepository);

// Produtos disponíveis para teste no Frontend
const sampleProducts = [
  { id: 'PROD-101', name: 'Notebook Ultrafino i7 16GB', category: 'Eletrônicos', price: 4500.00, image: '💻' },
  { id: 'PROD-102', name: 'Smartphone Pro Max 256GB', category: 'Mobile', price: 3200.00, image: '📱' },
  { id: 'PROD-103', name: 'Fone de Ouvido Bluetooth Noise-Canceling', category: 'Áudio', price: 650.00, image: '🎧' },
  { id: 'PROD-104', name: 'Monitor Gamer 27" 144Hz', category: 'Periféricos', price: 1400.00, image: '🖥️' }
];

// Rota GET /api/products
app.get('/api/products', (req, res) => {
  res.json({ success: true, data: sampleProducts });
});

// Rota POST /api/checkout (Executa o CheckoutUseCase com os 3 Patterns)
app.post('/api/checkout', async (req, res) => {
  try {
    const { customer, items, paymentDetails } = req.body;

    if (!customer || !items || !paymentDetails) {
      return res.status(400).json({
        success: false,
        error: 'Dados de checkout incompletos. Forneça customer, items e paymentDetails.'
      });
    }

    const result = await checkoutUseCase.execute({
      customer,
      items,
      paymentDetails
    });

    const logs = orderRepository.getLogs();

    return res.json({
      success: true,
      message: 'Checkout concluído!',
      data: {
        order: result.order,
        paymentResult: result.paymentResult,
        recentLogs: logs.slice(0, 10)
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno no servidor de checkout.'
    });
  }
});

// Rota GET /api/orders (Lista todos os pedidos)
app.get('/api/orders', async (req, res) => {
  const orders = await orderRepository.findAll();
  res.json({ success: true, count: orders.length, data: orders });
});

// Rota GET /api/logs (Lista logs do Observer Pattern)
app.get('/api/logs', (req, res) => {
  const logs = orderRepository.getLogs();
  res.json({ success: true, count: logs.length, data: logs });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Servidor MVP rodando em: http://localhost:${PORT}`);
  console.log(`Acesse a interface web para simular o checkout em tempo real!`);
  console.log(`=======================================================`);
});
