import { Order } from '../../orders/entities/order.entity';

export class DeliveryReportTemplate {
  constructor(private order: Order) {}

  generate(): string {
    const orderDate = new Date(this.order.orderDate).toLocaleDateString('ru-RU');
    const deliveryDate = this.order.deliverySurvey
      ? new Date(this.order.deliverySurvey.timestamp).toLocaleDateString('ru-RU')
      : 'Не доставлено';
    const deliveryTime = this.order.deliverySurvey
      ? new Date(this.order.deliverySurvey.timestamp).toLocaleTimeString('ru-RU')
      : '-';

    const itemsHTML = this.order.orderItems
      .map(
        (item) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.product.name}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity} шт</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
          <input type="checkbox" style="width: 16px; height: 16px;">
        </td>
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
        <title>Отчет о доставке №${this.order.id}</title>
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
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .header p {
            font-size: 13px;
            color: #666;
          }
          .status-badge {
            display: inline-block;
            padding: 5px 15px;
            background-color: #4CAF50;
            color: white;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-block {
            border: 1px solid #ddd;
            padding: 15px;
            background-color: #f9f9f9;
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
          .delivery-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .detail-card {
            border: 1px solid #ddd;
            padding: 12px;
            background-color: #fff;
            text-align: center;
          }
          .detail-card-label {
            font-size: 11px;
            color: #666;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .detail-card-value {
            font-size: 16px;
            font-weight: bold;
            color: #333;
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
          .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-top: 25px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #ddd;
          }
          .notes-section {
            border: 1px solid #ddd;
            padding: 15px;
            background-color: #f9f9f9;
            margin-bottom: 20px;
          }
          .notes-section h4 {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .notes-section textarea {
            width: 100%;
            height: 80px;
            padding: 8px;
            border: 1px solid #ddd;
            font-family: Arial, sans-serif;
            font-size: 12px;
          }
          .photo-section {
            border: 1px dashed #ddd;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
            background-color: #f0f0f0;
          }
          .photo-section p {
            font-size: 12px;
            color: #666;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 30px;
          }
          .signature {
            text-align: center;
            font-size: 12px;
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
            <h1>ОТЧЕТ О ДОСТАВКЕ</h1>
            <p>Заказ № ${this.order.id}</p>
            <div class="status-badge">${this.order.status}</div>
          </div>

          <div class="info-grid">
            <div class="info-block">
              <h3>Информация о заказе</h3>
              <p><strong>Номер:</strong> ${this.order.id}</p>
              <p><strong>Дата создания:</strong> ${orderDate}</p>
              <p><strong>Статус:</strong> ${this.order.status}</p>
              <p><strong>Примечания:</strong> ${this.order.notes || 'Отсутствуют'}</p>
            </div>

            <div class="info-block">
              <h3>Получатель</h3>
              <p><strong>${this.order.customer.name}</strong></p>
              <p><strong>Адрес:</strong> ${this.order.customer.address || 'Не указан'}</p>
              <p><strong>Телефон:</strong> ${this.order.customer.phone || 'Не указан'}</p>
              <p><strong>Тип клиента:</strong> ${this.order.customer.paymentType === 'прямые' ? 'Прямая' : 'Консигнация'}</p>
            </div>
          </div>

          <div class="delivery-details">
            <div class="detail-card">
              <div class="detail-card-label">Дата доставки</div>
              <div class="detail-card-value">${deliveryDate}</div>
            </div>
            <div class="detail-card">
              <div class="detail-card-label">Время доставки</div>
              <div class="detail-card-value">${deliveryTime}</div>
            </div>
            <div class="detail-card">
              <div class="detail-card-label">Кол-во товаров</div>
              <div class="detail-card-value">${this.order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}</div>
            </div>
          </div>

          <h2 class="section-title">Проверка товаров</h2>
          <table>
            <thead>
              <tr>
                <th>Наименование товара</th>
                <th style="width: 100px; text-align: center;">Кол-во</th>
                <th style="width: 100px; text-align: center;">Проверено ✓</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <h2 class="section-title">Фотография доставки</h2>
          <div class="photo-section">
            <p>${this.order.deliverySurvey?.photoUrl ? 'Фотография приложена' : 'Место для фотографии'}</p>
          </div>

          <h2 class="section-title">Примечания доставки</h2>
          <div class="notes-section">
            <h4>Проверка состояния товара:</h4>
            <textarea>${this.order.deliverySurvey?.stockCheckNotes || ''}</textarea>
          </div>

          <div class="notes-section">
            <h4>Примечания по размещению:</h4>
            <textarea>${this.order.deliverySurvey?.layoutNotes || ''}</textarea>
          </div>

          <div class="notes-section">
            <h4>Другие примечания:</h4>
            <textarea>${this.order.deliverySurvey?.otherNotes || ''}</textarea>
          </div>

          <div class="signatures">
            <div class="signature">
              <p><strong>Курьер:</strong></p>
              <div class="signature-line">
                <p>_________________</p>
                <p style="font-size: 10px; margin-top: 3px;">подпись</p>
              </div>
            </div>
            <div class="signature">
              <p><strong>Клиент:</strong></p>
              <div class="signature-line">
                <p>_________________</p>
                <p style="font-size: 10px; margin-top: 3px;">подпись и дата</p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
