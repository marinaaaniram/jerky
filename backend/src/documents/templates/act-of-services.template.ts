import { Order } from '../../orders/entities/order.entity';

export class ActOfServicesTemplate {
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

    const debt = this.order.customer.debt;
    const totalDebt = debt + totalAmount;

    return `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Акт выполненных работ №${this.order.id}</title>
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
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .header p {
            font-size: 13px;
            color: #666;
          }
          .period {
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 20px;
          }
          .period-label {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .period-value {
            font-size: 14px;
            font-weight: bold;
          }
          .parties {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
            font-size: 12px;
          }
          .party-block {
            border: 1px solid #ddd;
            padding: 15px;
          }
          .party-block h3 {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .party-block p {
            margin-bottom: 5px;
            line-height: 1.5;
          }
          .summary-header {
            font-size: 13px;
            font-weight: bold;
            margin: 20px 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 1px solid #ddd;
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
          .totals-section {
            display: grid;
            grid-template-columns: auto auto;
            gap: 20px;
            justify-content: flex-end;
            margin-bottom: 20px;
          }
          .totals-box {
            width: 250px;
            border: 1px solid #333;
          }
          .totals-row {
            display: grid;
            grid-template-columns: 1fr 100px;
            border-bottom: 1px solid #333;
            padding: 10px;
            font-size: 12px;
          }
          .totals-row:last-child {
            border-bottom: 2px solid #333;
            font-weight: bold;
          }
          .services-section {
            border: 1px solid #ddd;
            padding: 15px;
            background-color: #f9f9f9;
            margin-bottom: 20px;
            font-size: 12px;
          }
          .services-section h4 {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 11px;
          }
          .services-section p {
            margin-bottom: 5px;
            line-height: 1.5;
          }
          .debt-warning {
            border: 2px solid #ff9800;
            background-color: #fff3cd;
            padding: 15px;
            margin-bottom: 20px;
            font-size: 12px;
          }
          .debt-warning p {
            margin-bottom: 5px;
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
            margin-top: 30px;
          }
          .signature-line p {
            margin-bottom: 3px;
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
            <h1>АКТ ВЫПОЛНЕННЫХ РАБОТ И ОКАЗАННЫХ УСЛУГ</h1>
            <p>№ ${this.order.id} от ${orderDate}</p>
          </div>

          <div class="period">
            <div class="period-label">Период отчета</div>
            <div class="period-value">${orderDate}</div>
          </div>

          <div class="parties">
            <div class="party-block">
              <h3>Исполнитель</h3>
              <p><strong>ООО "Jerky Delivery"</strong></p>
              <p>ИНН: 7700000000</p>
              <p>Адрес: г. Москва</p>
              <p>Телефон: +7 (XXX) XXX-XX-XX</p>
              <p>Расчетный счет: не указан</p>
            </div>

            <div class="party-block">
              <h3>Заказчик</h3>
              <p><strong>${this.order.customer.name}</strong></p>
              <p>Адрес: ${this.order.customer.address || 'Не указан'}</p>
              <p>Телефон: ${this.order.customer.phone || 'Не указан'}</p>
              <p>Тип клиента: <strong>Консигнация</strong></p>
            </div>
          </div>

          <div class="services-section">
            <h4>Оказанные услуги:</h4>
            <p>В соответствии с договором консигнации от ${orderDate}, исполнитель оказал следующие услуги:</p>
            <p style="margin-top: 10px;">1. Поставку товаров на условиях консигнации</p>
            <p>2. Управление запасами и контроль остатков</p>
            <p>3. Логистическое обеспечение</p>
          </div>

          <h3 class="summary-header">Реализованный товар в отчетном периоде</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">№</th>
                <th>Наименование товара</th>
                <th style="width: 100px;">Кол-во</th>
                <th style="width: 100px; text-align: right;">Цена</th>
                <th style="width: 100px; text-align: right;">Сумма</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-box">
              <div class="totals-row">
                <span>Реализовано товара:</span>
                <span style="text-align: right;">${this.order.orderItems.reduce((sum, item) => sum + item.quantity, 0)} шт</span>
              </div>
              <div class="totals-row">
                <span>Сумма реализации:</span>
                <span style="text-align: right;">${totalAmount.toFixed(2)} ₽</span>
              </div>
            </div>
          </div>

          ${debt > 0 ? `
            <div class="debt-warning">
              <p><strong>⚠ Задолженость клиента:</strong></p>
              <p>Предыдущая задолженость: <strong>${debt.toFixed(2)} ₽</strong></p>
              <p>Сумма текущей реализации: <strong>${totalAmount.toFixed(2)} ₽</strong></p>
              <p style="margin-top: 10px; font-weight: bold;">ИТОГО ЗАДОЛЖЕНОСТЬ: ${totalDebt.toFixed(2)} ₽</p>
            </div>
          ` : ''}

          <h3 class="summary-header">Заключение</h3>
          <div class="services-section" style="border: 1px dashed #ddd; background-color: #fff;">
            <p>Обе стороны подтверждают, что работы и услуги выполнены полностью в соответствии с условиями договора консигнации.</p>
            <p style="margin-top: 10px;">Стороны согласны с содержанием данного акта и подтверждают его подписями:</p>
          </div>

          <div class="signatures">
            <div class="signature">
              <p><strong>От Исполнителя:</strong></p>
              <div class="signature-line">
                <p>__________________ (подпись)</p>
                <p style="font-size: 11px; margin-top: 5px;">Должность и ФИО</p>
              </div>
            </div>
            <div class="signature">
              <p><strong>От Заказчика:</strong></p>
              <div class="signature-line">
                <p>__________________ (подпись)</p>
                <p style="font-size: 11px; margin-top: 5px;">Должность и ФИО</p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
