"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaybillTemplate = void 0;
class WaybillTemplate {
    order;
    constructor(order) {
        this.order = order;
    }
    generate() {
        const orderDate = new Date(this.order.orderDate).toLocaleDateString('ru-RU');
        const totalAmount = this.order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const itemsHTML = this.order.orderItems
            .map((item) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.product.name}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.price.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `)
            .join('');
        return `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Накладная №${this.order.id}</title>
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
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .header p {
            font-size: 14px;
            color: #666;
          }
          .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .info-block {
            border: 1px solid #ddd;
            padding: 15px;
          }
          .info-block h3 {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
            color: #666;
          }
          .info-block p {
            font-size: 13px;
            margin-bottom: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            font-size: 12px;
          }
          td {
            border: 1px solid #ddd;
            padding: 8px;
            font-size: 12px;
          }
          .totals {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
          }
          .totals-box {
            width: 200px;
            border: 1px solid #333;
          }
          .totals-row {
            display: grid;
            grid-template-columns: 1fr 100px;
            border-bottom: 1px solid #333;
            padding: 10px;
          }
          .totals-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 14px;
          }
          .notes {
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 20px;
            background-color: #f9f9f9;
          }
          .notes h4 {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .notes p {
            font-size: 12px;
            white-space: pre-wrap;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 30px;
          }
          .signature {
            text-align: center;
            border-top: 1px solid #333;
            padding-top: 10px;
            font-size: 12px;
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
            <h1>НАКЛАДНАЯ</h1>
            <p>№ ${this.order.id} от ${orderDate}</p>
            <p>Статус: ${this.order.status}</p>
          </div>

          <div class="info-section">
            <div class="info-block">
              <h3>Отправитель (От)</h3>
              <p><strong>Jerky Delivery</strong></p>
              <p>Адрес: г. Москва</p>
              <p>Телефон: +7 (XXX) XXX-XX-XX</p>
            </div>

            <div class="info-block">
              <h3>Получатель (Кому)</h3>
              <p><strong>${this.order.customer.name}</strong></p>
              <p>Адрес: ${this.order.customer.address || 'Не указан'}</p>
              <p>Телефон: ${this.order.customer.phone || 'Не указан'}</p>
              <p>Тип оплаты: ${this.order.customer.paymentType === 'прямые' ? 'Прямая' : 'Консигнация'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Наименование товара</th>
                <th style="text-align: center; width: 80px;">Кол-во</th>
                <th style="text-align: right; width: 100px;">Цена</th>
                <th style="text-align: right; width: 100px;">Сумма</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-box">
              <div class="totals-row">
                <span>Итого товаров:</span>
                <span style="text-align: right;">${this.order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div class="totals-row">
                <span>Сумма:</span>
                <span style="text-align: right;">${totalAmount.toFixed(2)} ₽</span>
              </div>
            </div>
          </div>

          ${this.order.notes ? `
            <div class="notes">
              <h4>Примечания</h4>
              <p>${this.order.notes}</p>
            </div>
          ` : ''}

          <div class="signatures">
            <div class="signature">
              <p>Отправитель</p>
              <p style="margin-top: 30px;">_________________</p>
              <p style="font-size: 11px; margin-top: 5px;">Подпись и дата</p>
            </div>
            <div class="signature">
              <p>Получатель</p>
              <p style="margin-top: 30px;">_________________</p>
              <p style="font-size: 11px; margin-top: 5px;">Подпись и дата</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    }
}
exports.WaybillTemplate = WaybillTemplate;
//# sourceMappingURL=waybill.template.js.map