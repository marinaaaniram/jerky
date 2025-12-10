// js/views/customerDetails.js
import { canEdit } from '../auth.js';

export async function renderCustomerDetails(db, router, customerId) {
    const content = document.getElementById('content');

    const customerRes = db.exec(`SELECT id, name, address, phone, payment_type, debt, is_archived FROM customers WHERE id = ${customerId}`);
    if (!customerRes.length) { content.innerHTML = '<h2>Клиент не найден</h2>'; return; }
    
    const customer = customerRes[0].values[0];
    const [id, name, address, phone, payment_type, debt, is_archived] = customer;

    let html = `<h2>Карточка клиента: ${name} ${is_archived ? '(В архиве)' : ''}</h2>
                <p><strong>Адрес:</strong> ${address}</p><p><strong>Телефон:</strong> ${phone}</p>
                <p><strong>Тип оплаты:</strong> ${payment_type}</p><p><strong>Текущий долг:</strong> ${debt.toFixed(2)}</p>
                <a href="#customers">&larr; Назад к клиентам</a><hr>`;

    if (canEdit()) {
        const archiveBtnText = is_archived ? 'Восстановить из архива' : 'Архивировать';
        html += `<button id="archive-customer-btn">${archiveBtnText}</button><hr>`;
        html += `<h3>Внести платеж</h3>
                 <form id="add-payment-form">
                     <input type="number" name="amount" placeholder="Сумма" step="0.01" required>
                     <input type="date" name="payment_date" value="${new Date().toISOString().slice(0, 10)}" required>
                     <button type="submit">Добавить платеж</button>
                 </form><hr>`;
    }

    html += `<h3>История платежей</h3>`;
    const paymentsRes = db.exec(`SELECT amount, payment_date FROM payments WHERE customer_id = ${customerId} ORDER BY payment_date DESC`);
    let paymentsTable = '<table><thead><tr><th>Сумма</th><th>Дата</th></tr></thead><tbody>';
    if (paymentsRes.length) {
        paymentsRes[0].values.forEach(p => { paymentsTable += `<tr><td>${p[0].toFixed(2)}</td><td>${p[1]}</td></tr>`; });
    } else {
        paymentsTable += `<tr><td colspan="2">Платежей пока нет.</td></tr>`;
    }
    paymentsTable += '</tbody></table><hr>';
    html += paymentsTable;

    html += `<h3>Специальные цены</h3>`;
    if (canEdit()) {
        const productsRes = db.exec("SELECT id, name FROM products");
        let productOptions = productsRes.length ? productsRes[0].values.map(p => `<option value="${p[0]}">${p[1]}</option>`).join('') : '';
        html += `<form id="add-price-rule-form">
                    <select name="product_id" required>${productOptions}</select>
                    <input type="number" name="special_price" placeholder="Специальная цена" step="0.01" required>
                    <button type="submit">Добавить правило</button>
                 </form>`;
    }

    const rulesRes = db.exec(`SELECT pr.id, p.name, pr.special_price FROM price_rules pr JOIN products p ON pr.product_id = p.id WHERE pr.customer_id = ${customerId}`);
    let rulesTable = '<table><thead><tr><th>Товар</th><th>Специальная цена</th></tr></thead><tbody>';
    if (rulesRes.length) {
        rulesRes[0].values.forEach(r => { rulesTable += `<tr><td>${r[1]}</td><td>${r[2].toFixed(2)}</td></tr>`; });
    } else {
        rulesTable += `<tr><td colspan="2">Специальных цен нет.</td></tr>`;
    }
    rulesTable += '</tbody></table>';
    html += rulesTable;

    content.innerHTML = html;

    if (canEdit()) {
        document.getElementById('archive-customer-btn').addEventListener('click', async () => {
            const newStatus = is_archived ? 0 : 1;
            db.run("UPDATE customers SET is_archived = ? WHERE id = ?", [newStatus, customerId]);
            await router();
        });

        document.getElementById('add-payment-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const amount = parseFloat(formData.get('amount'));
            const date = formData.get('payment_date');
            db.run("INSERT INTO payments (customer_id, amount, payment_date) VALUES (?, ?, ?)", [customerId, amount, date]);
            db.run(`UPDATE customers SET debt = debt - ? WHERE id = ?`, [amount, customerId]);
            await router();
        });

        document.getElementById('add-price-rule-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const productId = formData.get('product_id');
            const specialPrice = parseFloat(formData.get('special_price'));
            db.run("INSERT OR REPLACE INTO price_rules (customer_id, product_id, special_price) VALUES (?, ?, ?)", [customerId, productId, specialPrice]);
            await router();
        });
    }
}