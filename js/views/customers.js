// js/views/customers.js
import { canEdit } from '../auth.js';

let showArchived = false;

export async function renderCustomers(db, router) {
    const content = document.getElementById('content');

    const query = showArchived ? "SELECT id, name, payment_type, debt, is_archived FROM customers" : "SELECT id, name, payment_type, debt, is_archived FROM customers WHERE is_archived = 0";
    const customers = db.exec(query);
    
    let table = '<table><thead><tr><th>ID</th><th>Имя</th><th>Тип оплаты</th><th>Долг</th><th>Статус</th></tr></thead><tbody>';
    if (customers.length) {
        customers[0].values.forEach(c => {
            table += `<tr ${c[4] ? 'style="opacity: 0.5;"' : ''}>
                        <td>${c[0]}</td>
                        <td><a href="#/customer/${c[0]}">${c[1]}</a></td>
                        <td>${c[2]}</td>
                        <td>${c[3].toFixed(2)}</td>
                        <td>${c[4] ? 'Архив' : 'Активен'}</td>
                      </tr>`;
        });
    }
    table += '</tbody></table>';

    let formHtml = '';
    if (canEdit()) {
        formHtml = `<h3>Добавить клиента</h3>
                    <form id="add-customer-form">
                        <input type="text" name="name" placeholder="Имя" required>
                        <input type="text" name="address" placeholder="Адрес" required>
                        <input type="text" name="phone" placeholder="Телефон" required>
                        <select name="payment_type"><option value="прямые">Прямые</option><option value="реализация">Реализация</option></select>
                        <button type="submit">Добавить</button>
                    </form>`;
    }

    const controls = `<div><label><input type="checkbox" id="show-archived-checkbox" ${showArchived ? 'checked' : ''}> Показать архивные</label></div>`;

    content.innerHTML = `<h2>Клиенты</h2>${controls}${table}${formHtml}`;

    document.getElementById('show-archived-checkbox').addEventListener('change', (e) => {
        showArchived = e.target.checked;
        router();
    });

    if (canEdit()) {
        document.getElementById('add-customer-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            db.run("INSERT INTO customers (name, address, phone, payment_type) VALUES (?, ?, ?, ?)", 
                [formData.get('name'), formData.get('address'), formData.get('phone'), formData.get('payment_type')]);
            await router();
        });
    }
}