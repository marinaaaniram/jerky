import { Order } from '../../orders/entities/order.entity';

export class InvoiceTemplate {
  constructor(private order: Order) {}

  generate(): string {
    const orderDate = new Date(this.order.orderDate).toLocaleDateString('ru-RU');
    const totalAmount = this.order.orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const itemsHTML = this.order.orderItems
      .map(
        (item, index) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.product.name}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity} шт</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.price.toFixed(2)} ₽</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${(item.price * item.quantity).toFixed(2)} ₽</td>
      </tr>
    `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Счет-фактура №${this.order.id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Arial', sans-serif;
            color: #333;
            line-height: 1.6;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .header h1 {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .header p {
            font-size: 12px;
            color: #666;
          }
          .doc-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
            font-size: 12px;
          }
          .info-item {
            border: 1px solid #ddd;
            padding: 10px;
          }
          .info-item-label {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 11px;
            text-transform: uppercase;
            color: #666;
          }
          .seller-buyer {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
            font-size: 12px;
          }
          .seller-buyer-block {
            border: 1px solid #ddd;
            padding: 15px;
          }
          .seller-buyer-block h3 {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .seller-buyer-block p {
            margin-bottom: 5px;
            line-height: 1.5;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
          }
          th {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
          }
          td {
            border: 1px solid #ddd;
            padding: 8px;
            font-size: 12px;
          }
          .summary {
            display: grid;
            grid-template-columns: auto auto;
            gap: 20px;
            margin-bottom: 20px;
            justify-content: flex-end;
          }
          .summary-block {
            width: 250px;
          }
          .summary-row {
            display: grid;
            grid-template-columns: 1fr 100px;
            border-bottom: 1px solid #ddd;
            padding: 8px;
            font-size: 12px;
          }
          .summary-row:last-child {
            border-bottom: 2px solid #333;
            font-weight: bold;
            font-size: 13px;
          }
          .payment-terms {
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 20px;
            background-color: #f9f9f9;
            font-size: 12px;
          }
          .payment-terms h4 {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 11px;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 30px;
            font-size: 12px;
          }
          .signature {
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #333;
            padding-top: 8px;
            margin-top: 25px;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .container {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>СЧЕТ-ФАКТУРА</h1>
            <p>№ ${this.order.id} от ${orderDate}</p>
          </div>

          <div class="doc-info">
            <div class="info-item">
              <div class="info-item-label">Счет №</div>
              <div>${this.order.id}</div>
            </div>
            <div class="info-item">
              <div class="info-item-label">Дата</div>
              <div>${orderDate}</div>
            </div>
          </div>

          <div class="seller-buyer">
            <div class="seller-buyer-block">
              <h3>Продавец</h3>
              <p><strong>ООО "Jerky Delivery"</strong></p>
              <p>ИНН: 7700000000</p>
              <p>Адрес: г. Москва</p>
              <p>Телефон: +7 (XXX) XXX-XX-XX</p>
              <p>Реквизиты банка: не указаны</p>
            </div>

            <div class="seller-buyer-block">
              <h3>Покупатель</h3>
              <p><strong>${this.order.customer.name}</strong></p>
              <p>Адрес: ${this.order.customer.address || 'Не указан'}</p>
              <p>Телефон: ${this.order.customer.phone || 'Не указан'}</p>
              <p>Тип оплаты: ${this.order.customer.paymentType === 'прямые' ? 'Прямая' : 'Консигнация'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 30px;">№</th>
                <th>Наименование</th>
                <th style="width: 100px;">Кол-во</th>
                <th style="width: 100px; text-align: right;">Цена</th>
                <th style="width: 100px; text-align: right;">Сумма</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-block">
              <div class="summary-row">
                <span>Сумма без НДС:</span>
                <span style="text-align: right;">${totalAmount.toFixed(2)} ₽</span>
              </div>
              <div class="summary-row">
                <span>НДС (18%):</span>
                <span style="text-align: right;">0.00 ₽</span>
              </div>
              <div class="summary-row">
                <span>ИТОГО:</span>
                <span style="text-align: right;">${totalAmount.toFixed(2)} ₽</span>
              </div>
            </div>
          </div>

          <div class="payment-terms">
            <h4>Условия оплаты</h4>
            <p>Платеж произвести на счет продавца в течение ${this.order.customer.paymentType === 'реализация' ? '30 дней' : '5 дней'} после получения счета-фактуры.</p>
            <p style="margin-top: 8px;">Банковские реквизиты: не указаны</p>
          </div>

          <div class="signatures">
            <div class="signature">
              <p><strong>Продавец:</strong></p>
              <div class="signature-line">
                <p>М.П.________________</p>
                <p style="font-size: 10px; margin-top: 3px;">подпись, печать</p>
              </div>
            </div>
            <div class="signature">
              <p><strong>Покупатель:</strong></p>
              <div class="signature-line">
                <p>М.П.________________</p>
                <p style="font-size: 10px; margin-top: 3px;">подпись, печать</p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
