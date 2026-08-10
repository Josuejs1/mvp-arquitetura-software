document.addEventListener('DOMContentLoaded', () => {
  let products = [];
  let selectedProducts = new Set(['PROD-101']);
  let activeMethod = 'PIX';

  const productsContainer = document.getElementById('productsContainer');
  const methodBtns = document.querySelectorAll('.method-btn');
  const ccOptions = document.getElementById('ccOptions');
  const btnProcessCheckout = document.getElementById('btnProcessCheckout');
  const resultCard = document.getElementById('resultCard');
  const resultContent = document.getElementById('resultContent');
  const terminalLogs = document.getElementById('terminalLogs');

  // 1. Carrega os produtos da API
  fetch('/api/products')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        products = data.data;
        renderProducts();
      }
    });

  function renderProducts() {
    productsContainer.innerHTML = '';
    products.forEach(p => {
      const isSelected = selectedProducts.has(p.id);
      const div = document.createElement('div');
      div.className = `product-option ${isSelected ? 'selected' : ''}`;
      div.innerHTML = `
        <span class="product-icon">${p.image}</span>
        <div class="product-details">
          <div class="product-name">${p.name}</div>
          <div class="product-price">R$ ${p.price.toFixed(2)}</div>
        </div>
      `;
      div.addEventListener('click', () => {
        if (selectedProducts.has(p.id)) {
          if (selectedProducts.size > 1) selectedProducts.delete(p.id);
        } else {
          selectedProducts.add(p.id);
        }
        renderProducts();
      });
      productsContainer.appendChild(div);
    });
  }

  // 2. Seleção do Método de Pagamento (Strategy)
  methodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      methodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeMethod = btn.dataset.method;

      if (activeMethod === 'CREDIT_CARD') {
        ccOptions.style.display = 'block';
        document.getElementById('activeStrategy').innerText = 'CreditCardPaymentStrategy (Com parcelamento)';
      } else {
        ccOptions.style.display = 'none';
        if (activeMethod === 'PIX') {
          document.getElementById('activeStrategy').innerText = 'PixPaymentStrategy (Desconto 10%)';
        } else {
          document.getElementById('activeStrategy').innerText = 'BoletoPaymentStrategy (+R$ 2,50 taxa)';
        }
      }
    });
  });

  // 3. Execução do Checkout
  btnProcessCheckout.addEventListener('click', async () => {
    btnProcessCheckout.disabled = true;
    btnProcessCheckout.innerHTML = '⏳ PROCESSANDO COM DESIGN PATTERNS...';

    const customerName = document.getElementById('customerName').value || 'Cliente Teste';
    const customerEmail = document.getElementById('customerEmail').value || 'cliente@exemplo.com';
    const installments = parseInt(document.getElementById('installments').value, 10);
    const creditCardNumber = document.getElementById('cardNumber').value;

    const items = Array.from(selectedProducts).map(id => {
      const prod = products.find(p => p.id === id);
      return {
        id: prod.id,
        name: prod.name,
        unitPrice: prod.price,
        quantity: 1
      };
    });

    const payload = {
      customer: {
        id: 'CUST-101',
        name: customerName,
        email: customerEmail,
        phone: '(98) 98888-7777'
      },
      items,
      paymentDetails: {
        method: activeMethod,
        installments: activeMethod === 'CREDIT_CARD' ? installments : 1,
        creditCardNumber: activeMethod === 'CREDIT_CARD' ? creditCardNumber : undefined
      }
    };

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const res = await response.json();
      btnProcessCheckout.disabled = false;
      btnProcessCheckout.innerHTML = '🚀 PROCESSAR CHECKOUT AGORA';

      if (res.success) {
        displayResult(res.data);
        fetchLogs();
      } else {
        alert('Erro no checkout: ' + res.error);
      }
    } catch (err) {
      btnProcessCheckout.disabled = false;
      btnProcessCheckout.innerHTML = '🚀 PROCESSAR CHECKOUT AGORA';
      alert('Erro na comunicação com o servidor.');
    }
  });

  function displayResult(data) {
    resultCard.style.display = 'block';
    const { order, paymentResult } = data;

    const isSuccess = paymentResult.success;
    const boxClass = isSuccess ? 'result-box' : 'result-box failed';
    const titleText = isSuccess ? '✅ PAGAMENTO APROVADO' : '❌ PAGAMENTO RECUSADO';

    let extraHtml = '';
    if (paymentResult.qrCode) {
      extraHtml = `
        <div style="margin-top: 10px; font-weight: bold; font-size: 12px; color: var(--accent-emerald);">QR CODE PIX GERADO:</div>
        <div class="qr-preview">${paymentResult.qrCode}</div>
      `;
    } else if (paymentResult.barcode) {
      extraHtml = `
        <div style="margin-top: 10px; font-weight: bold; font-size: 12px; color: var(--accent-amber);">CÓDIGO DE BARRAS BOLETO:</div>
        <div class="barcode-preview">${paymentResult.barcode}</div>
      `;
    }

    resultContent.innerHTML = `
      <div class="${boxClass}">
        <div class="result-header">
          <span>${titleText}</span>
          <span style="margin-left: auto; font-size: 12px; opacity: 0.8;">#${order.id}</span>
        </div>
        <p><strong>Mensagem:</strong> ${paymentResult.message}</p>
        <p><strong>Transação:</strong> <code>${paymentResult.transactionId}</code></p>
        <p><strong>Subtotal:</strong> R$ ${order.subtotal.toFixed(2)} | <strong>Total Pago:</strong> R$ ${paymentResult.amountPaid.toFixed(2)}</p>
        ${extraHtml}
      </div>
    `;
  }

  function fetchLogs() {
    fetch('/api/logs')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          terminalLogs.innerHTML = '';
          data.data.forEach(log => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString();
            const div = document.createElement('div');
            div.className = `log-entry ${log.eventType}`;
            div.innerHTML = `
              <span class="log-time">[${timeStr}]</span>
              <span class="log-type">${log.eventType}</span>
              <span> - Pedido #${log.orderId}: ${log.details}</span>
            `;
            terminalLogs.appendChild(div);
          });
        }
      });
  }

  // Carrega logs iniciais
  fetchLogs();
});
