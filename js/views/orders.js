// js/views/orders.js
import { canManageStock } from '../auth.js';

let showArchived = false;

export async function renderOrders(db, router) {
    const content = document.getElementById('content');
    
    const query = showArchived 
        ? `SELECT o.id, c.name, o.order_date, o.status FROM orders o JOIN customers c ON o.customer_id = c.id ORDER BY o.order_date DESC` 
        : `SELECT o.id, c.name, o.order_date, o.status FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.is_archived = 0 ORDER BY o.order_date DESC`;
    const orders = db.exec(query);
    
    let table = '<table class="data-table"><thead><tr><th>ID</th><th>Клиент</th><th>Дата</th><th>Статус</th></tr></thead><tbody>';
    if (orders.length) {
        orders[0].values.forEach(order => {
            const [id, customerName, date, status] = order;
            table += `<tr>
                        <td data-label="ID"><a href="#/order/${id}">${id}</a></td>
                        <td data-label="Клиент">${customerName}</td>
                        <td data-label="Дата">${date}</td>
                        <td data-label="Статус"><span class="status status-${status.toLowerCase().replace(' ', '-')}">${status}</span></td>
                      </tr>`;
        });
    }
    table += '</tbody></table>';

    let formHtml = '';
    if (await canManageStock()) {
        const customers = db.exec("SELECT id, name FROM customers WHERE is_archived = 0 ORDER BY name");
        let customerOptions = customers.length ? customers[0].values.map(c => `<option value="${c[0]}">${c[1]}</option>`).join('') : '';
        formHtml = `<div class="form-container">
                        <h3>Новый заказ</h3>
                        <form id="add-order-form" class="add-form">
                            <div class="form-row">
                                <select name="customer_id" required><option value="">Выберите клиента</option>${customerOptions}</select>
                                <input type="date" name="order_date" value="${new Date().toISOString().slice(0, 10)}" required>
                            </div>
                            <button type="submit">Создать заказ</button>
                        </form>
                    </div>`;
    }
    
    const controls = `<div class="controls page-section"><label><input type="checkbox" id="show-archived-orders-checkbox" ${showArchived ? 'checked' : ''}> Показать заказы для архивных клиентов</label></div>`;

    content.innerHTML = `<h2>Заказы</h2><div class="page-content">${controls}${table}${formHtml}</div>`;
    
    document.getElementById('show-archived-orders-checkbox').addEventListener('change', (e) => {
        showArchived = e.target.checked;
        renderOrders(db, router); // Re-render instead of full router reload
    });

    if (await canManageStock()) {
        document.getElementById('add-order-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            db.run("INSERT INTO orders (customer_id, order_date, status) VALUES (?, ?, 'Новый')", [formData.get('customer_id'), formData.get('order_date')]);
            renderOrders(db, router); // Re-render for instant update
        });
    }
}
