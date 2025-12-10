// js/views/orderDetails.js
import { canChangeStatus, canManageStock, isCourier } from '../auth.js';

export async function renderOrderDetails(db, router, orderId) {
    const content = document.getElementById('content');
    
    const orderRes = db.exec(`SELECT o.id, c.name, o.order_date, o.status, o.customer_id, c.address FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ${orderId}`);
    if (!orderRes.length) { content.innerHTML = '<h2>Заказ не найден</h2>'; return; }
    
    const order = orderRes[0].values[0];
    const [o_id, c_name, o_date, o_status, c_id, c_address] = order;
    
    let html = `<h2>Детали заказа #${o_id}</h2>
                <p><strong>Клиент:</strong> <a href="#/customer/${c_id}">${c_name}</a></p>
                <p><strong>Адрес:</strong> ${c_address}</p>
                <p><strong>Дата:</strong> ${o_date}</p>
                <p><strong>Статус:</strong> ${o_status}</p>
                <a href="#orders">&larr; Назад к заказам</a>
                <button id="print-invoice-btn" style="margin-left: 20px;">Печать накладной</button>`;

    if (await canChangeStatus() && o_status !== 'Доставлен') {
        const statuses = ['Новый', 'В сборке', 'Передан курьеру', 'Доставлен'];
        const statusOptions = statuses.map(s => `<option value="${s}" ${s === o_status ? 'selected' : ''}>${s}</option>`).join('');
        html += `<hr><h3>Изменить статус</h3>
                 <form id="update-status-form"><select name="status">${statusOptions}</select><button type="submit">Обновить</button></form>`;
    }

    html += `<hr><h3>Товары в заказе</h3>`;
    const itemsRes = db.exec(`SELECT p.name, oi.quantity, oi.price FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ${orderId}`);
    let itemsTable = '<table><thead><tr><th>Товар</th><th>Количество</th><th>Цена</th><th>Сумма</th></tr></thead><tbody>';
    let total = 0;
    if (itemsRes.length) {
        itemsRes[0].values.forEach(item => {
            const itemTotal = item[1] * item[2];
            total += itemTotal;
            itemsTable += `<tr><td>${item[0]}</td><td>${item[1]}</td><td>${item[2].toFixed(2)}</td><td>${itemTotal.toFixed(2)}</td></tr>`;
        });
    }
    itemsTable += `</tbody><tfoot><tr><th colspan="3">Итого:</th><th>${total.toFixed(2)}</th></tr></tfoot></table>`;
    html += itemsTable;

    if (await canManageStock() && o_status !== 'Доставлен') {
        const productsRes = db.exec("SELECT id, name, stock_quantity FROM products WHERE stock_quantity > 0");
        let productOptions = productsRes.length ? productsRes[0].values.map(p => `<option value="${p[0]}">${p[1]} (на складе: ${p[2]})</option>`).join('') : '';
        html += `<h3>Добавить товар</h3>
                 <form id="add-item-form">
                     <input type="hidden" name="order_id" value="${orderId}">
                     <select name="product_id" required>${productOptions}</select>
                     <input type="number" name="quantity" placeholder="Количество" min="1" value="1" required>
                     <button type="submit">Добавить</button>
                 </form>`;
    }

    html += `<hr><h3>Анкета курьера</h3>`;
    const surveyRes = db.exec(`SELECT photo_url, stock_check_notes, layout_notes, other_notes, timestamp FROM delivery_surveys WHERE order_id = ${orderId}`);
    if (surveyRes.length) {
        const survey = surveyRes[0].values[0];
        html += `<div class="survey-display">
                    <p><strong>Фото-подтверждение:</strong> ${survey[0] || 'Нет'}</p>
                    <p><strong>Проверка остатков:</strong> ${survey[1] || 'Нет'}</p>
                    <p><strong>Выкладка:</strong> ${survey[2] || 'Нет'}</p>
                    <p><strong>Прочее:</strong> ${survey[3] || 'Нет'}</p>
                    <p><em>Заполнено: ${survey[4]}</em></p>
                 </div>`;
    } else if (o_status !== 'Доставлен') {
        const isCourierAndReady = await isCourier() && o_status === 'Передан курьеру';
        html += `<form id="survey-form">
                    <fieldset ${!isCourierAndReady ? 'disabled' : ''}>
                        <label>Фото-подтверждение: <input type="file" name="photo"></label>
                        <label>Заметки по остаткам: <textarea name="stock_notes"></textarea></label>
                        <label>Заметки по выкладке: <textarea name="layout_notes"></textarea></label>
                        <label>Прочие заметки: <textarea name="other_notes"></textarea></label>
                        <button type="submit">Отправить анкету</button>
                    </fieldset>
                    ${!isCourierAndReady ? '<p><em>Анкету можно заполнить, когда заказ передан курьеру.</em></p>' : ''}
                 </form>`;
    } else {
        html += `<p>Анкета не была заполнена.</p>`;
    }

    content.innerHTML = html;

    document.getElementById('print-invoice-btn').addEventListener('click', () => {
        const invoiceWindow = window.open('', 'PRINT', 'height=600,width=800');
        invoiceWindow.document.write('<html><head><title>Накладная</title>');
        invoiceWindow.document.write('<style>body{font-family:sans-serif; margin: 20px;} table{width:100%; border-collapse:collapse;} td,th{border:1px solid #ddd; padding:8px;} th{background-color:#f2f2f2;}</style>');
        invoiceWindow.document.write('</head><body>');
        invoiceWindow.document.write(`<h1>Накладная №${o_id} от ${o_date}</h1>`);
        invoiceWindow.document.write(`<p><strong>Поставщик:</strong> Jerky App</p>`);
        invoiceWindow.document.write(`<p><strong>Покупатель:</strong> ${c_name} (Адрес: ${c_address})</p><hr>`);
        invoiceWindow.document.write(itemsTable);
        invoiceWindow.document.write('<br><p><strong>Подпись поставщика: ___________________</p>');
        invoiceWindow.document.write('<p><strong>Подпись покупателя: ___________________</p>');
        invoiceWindow.document.write('</body></html>');
        invoiceWindow.document.close();
        invoiceWindow.focus();
        invoiceWindow.print();
    });

    if (document.getElementById('survey-form')) {
        document.getElementById('survey-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const photoFile = formData.get('photo');
            db.run("INSERT INTO delivery_surveys (order_id, photo_url, stock_check_notes, layout_notes, other_notes, timestamp) VALUES (?, ?, ?, ?, ?, ?)", [
                orderId, photoFile ? photoFile.name : null, formData.get('stock_notes'), formData.get('layout_notes'), formData.get('other_notes'), new Date().toLocaleString()
            ]);
            await router();
        });
    }
    
    if (await canChangeStatus() && o_status !== 'Доставлен') {
        document.getElementById('update-status-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newStatus = new FormData(e.target).get('status');
            if (newStatus === 'Доставлен') {
                const customerRes = db.exec(`SELECT payment_type FROM customers WHERE id = ${c_id}`);
                if (customerRes[0].values[0][0] === 'реализация') {
                    db.run(`UPDATE customers SET debt = debt + ? WHERE id = ?`, [total, c_id]);
                }
                const orderItems = db.exec(`SELECT product_id, quantity FROM order_items WHERE order_id = ${orderId}`);
                if (orderItems.length) {
                    orderItems[0].values.forEach(item => {
                        const [productId, quantity] = item;
                        db.run("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?", [quantity, productId]);
                        db.run("INSERT INTO stock_movements (product_id, quantity_change, reason, movement_date) VALUES (?, ?, 'продажа', ?)", [productId, -quantity, new Date().toISOString().slice(0, 10)]);
                    });
                }
            }
            db.run("UPDATE orders SET status = ? WHERE id = ?", [newStatus, orderId]);
            await router();
        });
    }

    if (await canManageStock() && o_status !== 'Доставлен') {
        document.getElementById('add-item-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = new FormData(e.target);
            const productId = data.get('product_id');
            const quantity = parseInt(data.get('quantity'));
            
            const stockRes = db.exec(`SELECT stock_quantity FROM products WHERE id = ${productId}`);
            if (quantity > stockRes[0].values[0][0]) {
                alert(`Недостаточно товара на складе!`);
                return;
            }

            const priceRuleRes = db.exec(`SELECT special_price FROM price_rules WHERE customer_id = ${c_id} AND product_id = ${productId}`);
            let price;
            if (priceRuleRes.length) {
                price = priceRuleRes[0].values[0][0];
            } else {
                const productPriceRes = db.exec(`SELECT price FROM products WHERE id = ${productId}`);
                price = productPriceRes[0].values[0][0];
            }
            
            db.run("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)", [o_id, productId, quantity, price]);
            await router();
        });
    }
}