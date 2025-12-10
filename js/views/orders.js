// js/views/orders.js
import { canManageStock } from '../auth.js';

let showArchived = false;

export async function renderOrders(db, router) {
    const content = document.getElementById('content');
    
    const query = showArchived 
        ? `SELECT o.id, c.name, o.order_date, o.status FROM orders o JOIN customers c ON o.customer_id = c.id` 
        : `SELECT o.id, c.name, o.order_date, o.status FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.is_archived = 0`;
    const orders = db.exec(query);
    
    let table = '<table><thead><tr><th>ID</th><th>Клиент</th><th>Дата</th><th>Статус</th></tr></thead><tbody>';
    if (orders.length) {
        orders[0].values.forEach(order => {
            table += `<tr><td><a href="#/order/${order[0]}">${order[0]}</a></td><td>${order[1]}</td><td>${order[2]}</td><td>${order[3]}</td></tr>`;
        });
    }
    table += '</tbody></table>';

    let formHtml = '';
    if (await canManageStock()) {
        const customers = db.exec("SELECT id, name FROM customers WHERE is_archived = 0");
        let customerOptions = customers.length ? customers[0].values.map(c => `<option value="${c[0]}">${c[1]}</option>`).join('') : '';
        formHtml = `<h3>Новый заказ</h3>
                    <form id="add-order-form">
                        <select name="customer_id" required><option value="">Выберите клиента</option>${customerOptions}</select>
                        <input type="date" name="order_date" value="${new Date().toISOString().slice(0, 10)}" required>
                        <button type="submit">Создать заказ</button>
                    </form>`;
    }
    
    const controls = `<div><label><input type="checkbox" id="show-archived-orders-checkbox" ${showArchived ? 'checked' : ''}> Показать заказы для архивных клиентов</label></div>`;

    content.innerHTML = `<h2>Заказы</h2>${controls}${table}${formHtml}`;
    
    document.getElementById('show-archived-orders-checkbox').addEventListener('change', (e) => {
        showArchived = e.target.checked;
        router();
    });

    if (await canManageStock()) {
        document.getElementById('add-order-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            db.run("INSERT INTO orders (customer_id, order_date, status) VALUES (?, ?, 'Новый')", [formData.get('customer_id'), formData.get('order_date')]);
            await router();
        });
    }
}