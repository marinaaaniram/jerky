// js/views/orderDetails.js
import { canChangeStatus, canManageStock, isCourier } from '../auth.js';

export async function renderOrderDetails(db, router, orderId) {
    const content = document.getElementById('content');
    
    const orderRes = db.exec(`SELECT o.id, c.name, o.order_date, o.status, o.customer_id, c.address FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ${orderId}`);
    if (!orderRes.length) { content.innerHTML = '<h2>Заказ не найден</h2>'; return; }
    
    const order = orderRes[0].values[0];
    const [o_id, c_name, o_date, o_status, c_id, c_address] = order;
    
    let detailsHtml = `<div class="page-section">
                        <p><strong>Клиент:</strong> <a href="#/customer/${c_id}">${c_name}</a></p>
                        <p><strong>Адрес:</strong> ${c_address}</p>
                        <p><strong>Дата:</strong> ${o_date}</p>
                        <p><strong>Статус:</strong> <span class="status status-${o_status.toLowerCase().replace(' ', '-')}">${o_status}</span></p>
                        <a href="#orders" class="button-link">&larr; Назад к заказам</a>
                        <button id="print-invoice-btn" class="button-link" style="margin-left: 10px;">Печать накладной</button>
                    </div>`;

    let statusFormHtml = '';
    if (await canChangeStatus() && o_status !== 'Доставлен') {
        const statuses = ['Новый', 'В сборке', 'Передан курьеру', 'Доставлен'];
        const statusOptions = statuses.map(s => `<option value="${s}" ${s === o_status ? 'selected' : ''}>${s}</option>`).join('');
        statusFormHtml = `<div class="page-section form-container">
                            <h3>Изменить статус</h3>
                            <form id="update-status-form" class="add-form">
                                <div class="form-row">
                                    <select name="status">${statusOptions}</select>
                                    <button type="submit">Обновить</button>
                                </div>
                            </form>
                         </div>`;
    }

    let itemsHtml = `<div class="page-section">
                        <h3>Товары в заказе</h3>`;
    const itemsRes = db.exec(`SELECT p.name, oi.quantity, oi.price FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ${orderId}`);
    let itemsTable = '<table class="data-table"><thead><tr><th>Товар</th><th>Количество</th><th>Цена</th><th>Сумма</th></tr></thead><tbody>';
    let total = 0;
    if (itemsRes.length) {
        itemsRes[0].values.forEach(item => {
            const [name, quantity, price] = item;
            const itemTotal = quantity * price;
            total += itemTotal;
            itemsTable += `<tr>
                            <td data-label="Товар">${name}</td>
                            <td data-label="Количество">${quantity}</td>
                            <td data-label="Цена">${price.toFixed(2)}</td>
                            <td data-label="Сумма">${itemTotal.toFixed(2)}</td>
                           </tr>`;
        });
    }
    itemsTable += `</tbody><tfoot><tr><th colspan="3">Итого:</th><th>${total.toFixed(2)}</th></tr></tfoot></table>`;
    itemsHtml += itemsTable + '</div>';

    let addItemFormHtml = '';
    if (await canManageStock() && o_status !== 'Доставлен') {
        const productsRes = db.exec("SELECT id, name, stock_quantity FROM products WHERE stock_quantity > 0 ORDER BY name");
        let productOptions = productsRes.length ? productsRes[0].values.map(p => `<option value="${p[0]}">${p[1]} (на складе: ${p[2]})</option>`).join('') : '';
        addItemFormHtml = `<div class="page-section form-container">
                            <h3>Добавить товар</h3>
                            <form id="add-item-form" class="add-form">
                                <input type="hidden" name="order_id" value="${orderId}">
                                <div class="form-row">
                                    <select name="product_id" required><option value="">Выберите товар</option>${productOptions}</select>
                                    <input type="number" name="quantity" placeholder="Количество" min="1" value="1" required>
                                </div>
                                <button type="submit">Добавить</button>
                            </form>
                         </div>`;
    }

    let surveyHtml = `<div class="page-section"><h3>Анкета курьера</h3>`;
    const surveyRes = db.exec(`SELECT photo_url, stock_check_notes, layout_notes, other_notes, timestamp FROM delivery_surveys WHERE order_id = ${orderId}`);
    if (surveyRes.length) {
        const survey = surveyRes[0].values[0];
        surveyHtml += `<div class="survey-display">
                        <div class="survey-item"><strong>Фото-подтверждение:</strong> ${survey[0] ? `<a href="${survey[0]}" target="_blank"><img src="${survey[0]}" alt="Фото" class="survey-photo"></a>` : 'Нет'}</div>
                        <div class="survey-item"><strong>Проверка остатков:</strong> <p>${survey[1] || 'Нет'}</p></div>
                        <div class="survey-item"><strong>Выкладка:</strong> <p>${survey[2] || 'Нет'}</p></div>
                        <div class="survey-item"><strong>Прочее:</strong> <p>${survey[3] || 'Нет'}</p></div>
                        <p><em>Заполнено: ${survey[4]}</em></p>
                     </div>`;
    } else if (o_status !== 'Доставлен') {
        const isCourierAndReady = await isCourier() && o_status === 'Передан курьеру';
        surveyHtml += `<form id="survey-form" class="add-form">
                        <fieldset ${!isCourierAndReady ? 'disabled' : ''}>
                            <div>
                                <label for="photo-upload">Фото-подтверждение</label>
                                <input type="file" name="photo" id="photo-upload" accept="image/*">
                                <label for="photo-upload" class="custom-file-upload">Выберите файл...</label>
                            </div>
                            <div><label for="stock_notes">Заметки по остаткам:</label><textarea id="stock_notes" name="stock_notes"></textarea></div>
                            <div><label for="layout_notes">Заметки по выкладке:</label><textarea id="layout_notes" name="layout_notes"></textarea></div>
                            <div><label for="other_notes">Прочие заметки:</label><textarea id="other_notes" name="other_notes"></textarea></div>
                            <button type="submit">Отправить анкету</button>
                        </fieldset>
                        ${!isCourierAndReady ? '<p><em>Анкету можно заполнить, когда заказ передан курьеру.</em></p>' : ''}
                     </form>`;
    } else {
        surveyHtml += `<p>Анкета не была заполнена.</p>`;
    }
    surveyHtml += `</div>`;

    content.innerHTML = `<h2>Детали заказа #${o_id}</h2><div class="page-content">${detailsHtml}${statusFormHtml}${itemsHtml}${addItemFormHtml}${surveyHtml}</div>`;

    // Re-attach all event listeners after rendering
    attachEventListeners(db, router, { orderId, o_status, c_id, total });
}

function attachEventListeners(db, router, { orderId, o_status, c_id, total }) {
    document.getElementById('print-invoice-btn').addEventListener('click', () => {
        const itemsTableHtml = document.querySelector('.data-table').outerHTML;
        const orderRes = db.exec(`SELECT c.name, o.order_date, c.address FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ${orderId}`);
        const [c_name, o_date, c_address] = orderRes[0].values[0];

        const invoiceWindow = window.open('', 'PRINT', 'height=600,width=800');
        invoiceWindow.document.write('<html><head><title>Накладная</title>');
        invoiceWindow.document.write('<style>body{font-family:sans-serif; margin: 20px;} table{width:100%; border-collapse:collapse;} td,th{border:1px solid #ddd; padding:8px;} th{background-color:#f2f2f2;}</style>');
        invoiceWindow.document.write('</head><body>');
        invoiceWindow.document.write(`<h1>Накладная №${orderId} от ${o_date}</h1>`);
        invoiceWindow.document.write(`<p><strong>Поставщик:</strong> Jerky App</p>`);
        invoiceWindow.document.write(`<p><strong>Покупатель:</strong> ${c_name} (Адрес: ${c_address})</p><hr>`);
        invoiceWindow.document.write(itemsTableHtml);
        invoiceWindow.document.write('<br><p><strong>Подпись поставщика: ___________________</p>');
        invoiceWindow.document.write('<p><strong>Подпись покупателя: ___________________</p>');
        invoiceWindow.document.write('</body></html>');
        invoiceWindow.document.close();
        invoiceWindow.focus();
        invoiceWindow.print();
    });

    const surveyForm = document.getElementById('survey-form');
    if (surveyForm) {
        surveyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const photoFile = formData.get('photo');
            // In a real app, you would upload the file and get a URL.
            // For this example, we'll just use the file name as a placeholder.
            const photoUrl = photoFile && photoFile.size > 0 ? `images/${photoFile.name}` : null;
            db.run("INSERT INTO delivery_surveys (order_id, photo_url, stock_check_notes, layout_notes, other_notes, timestamp) VALUES (?, ?, ?, ?, ?, ?)", [
                orderId, photoUrl, formData.get('stock_notes'), formData.get('layout_notes'), formData.get('other_notes'), new Date().toLocaleString()
            ]);
            renderOrderDetails(db, router, orderId);
        });
    }
    
    const updateStatusForm = document.getElementById('update-status-form');
    if (updateStatusForm) {
        updateStatusForm.addEventListener('submit', async (e) => {
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
            renderOrderDetails(db, router, orderId);
        });
    }

    const addItemForm = document.getElementById('add-item-form');
    if (addItemForm) {
        addItemForm.addEventListener('submit', async (e) => {
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
            
            db.run("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)", [orderId, productId, quantity, price]);
            renderOrderDetails(db, router, orderId);
        });
    }
}
