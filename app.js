window.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements & App State ---
    const content = document.getElementById('content');
    const navLinks = document.getElementById('nav-links');
    const loginModal = document.getElementById('login-modal');
    const userSelect = document.getElementById('user-select');
    const loginButton = document.getElementById('login-button');
    const userInfo = document.getElementById('user-info');
    let currentUser = null;
    let showArchived = false; // State for the checkbox

    // --- Permissions ---
    const rolePermissions = {
        'Руководитель': ['orders', 'products', 'customers', 'reports', 'customer', 'order'],
        'Менеджер по продажам': ['orders', 'customers', 'reports', 'customer', 'order'],
        'Кладовщик': ['orders', 'products', 'order'],
        'Курьер': ['orders', 'order'],
        'Наблюдатель': ['orders', 'products', 'customers', 'reports', 'customer', 'order']
    };
    function canEdit() { return ['Руководитель', 'Менеджер по продажам'].includes(currentUser.role); }
    function canManageStock() { return ['Руководитель', 'Кладовщик'].includes(currentUser.role); }
    function canChangeStatus() { return ['Руководитель', 'Кладовщик', 'Курьер'].includes(currentUser.role); }
    function isCourier() { return currentUser.role === 'Курьер'; }

    // --- App Initialization & Login ---
    async function init() {
        await initDatabase();
        checkLoginState();
    }

    function checkLoginState() {
        const userData = sessionStorage.getItem('currentUser');
        if (userData) {
            currentUser = JSON.parse(userData);
            showApp();
        } else {
            showLogin();
        }
    }

    async function showLogin() {
        loginModal.style.display = 'flex';
        const usersRes = db.exec("SELECT u.id, u.name, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id");
        if (usersRes.length) {
            userSelect.innerHTML = usersRes[0].values.map(user => `<option value="${user[0]}">${user[1]} (${user[2]})</option>`).join('');
        }
        loginButton.onclick = () => {
            const userId = userSelect.value;
            const userRes = db.exec(`SELECT u.id, u.name, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ${userId}`);
            const user = userRes[0].values[0];
            currentUser = { id: user[0], name: user[1], role: user[2] };
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            showApp();
        };
    }

    function showApp() {
        loginModal.style.display = 'none';
        window.addEventListener('hashchange', router);
        updateNavigation();
        updateUserInfo();
        router();
    }
    
    function logout() {
        sessionStorage.removeItem('currentUser');
        currentUser = null;
        window.location.hash = '';
        window.location.reload();
    }

    // --- UI Updates ---
    function updateNavigation() {
        const permissions = rolePermissions[currentUser.role] || [];
        navLinks.innerHTML = '';
        if (permissions.includes('orders')) navLinks.innerHTML += `<li><a href="#orders">Заказы</a></li>`;
        if (permissions.includes('products')) navLinks.innerHTML += `<li><a href="#products">Товары</a></li>`;
        if (permissions.includes('customers')) navLinks.innerHTML += `<li><a href="#customers">Клиенты</a></li>`;
        if (permissions.includes('reports')) navLinks.innerHTML += `<li><a href="#reports">Отчеты</a></li>`;
    }

    function updateUserInfo() {
        if (!currentUser) { userInfo.innerHTML = ''; return; }
        userInfo.innerHTML = `<span>${currentUser.name} (${currentUser.role})</span><button id="logout-button">Выйти</button>`;
        document.getElementById('logout-button').onclick = logout;
    }

    // --- Router ---
    async function router() {
        if (!currentUser) return;
        const hash = window.location.hash || '#orders';
        const page = hash.startsWith('#/order/') ? 'order' : (hash.startsWith('#/customer/') ? 'customer' : hash.substring(1) || 'orders');
        const permissions = rolePermissions[currentUser.role] || [];
        if (!permissions.includes(page)) {
             content.innerHTML = '<h2>Доступ запрещен</h2>';
             return;
        }
        content.innerHTML = '<h2>Загрузка...</h2>';
        const routes = {
            'order': () => renderOrderDetails(hash.split('/')[2]),
            'customer': () => renderCustomerDetails(hash.split('/')[2]),
            'orders': renderOrders,
            'products': renderProducts,
            'customers': renderCustomers,
            'reports': renderReports
        };
        (routes[page] || routes['orders'])();
    }
    
    // --- Render Functions ---

    async function renderReports() {
        let html = `<h2>Отчеты</h2>
                    <h3>Продажи по товарам</h3>
                    <form id="sales-report-form">
                        <label>С: <input type="date" name="start_date"></label>
                        <label>По: <input type="date" name="end_date"></label>
                        <button type="submit">Сформировать</button>
                    </form>
                    <div id="report-results"></div>`;
        content.innerHTML = html;

        document.getElementById('sales-report-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const startDate = formData.get('start_date');
            const endDate = formData.get('end_date');

            let query = `
                SELECT p.name, SUM(oi.quantity), SUM(oi.quantity * oi.price)
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.status = 'Доставлен'
            `;
            const params = [];
            if (startDate) {
                query += ' AND o.order_date >= ?';
                params.push(startDate);
            }
            if (endDate) {
                query += ' AND o.order_date <= ?';
                params.push(endDate);
            }
            query += ' GROUP BY p.name ORDER BY SUM(oi.quantity * oi.price) DESC';

            const reportRes = db.exec(query, params);
            
            let table = '<table><thead><tr><th>Товар</th><th>Продано (шт.)</th><th>Сумма продаж</th></tr></thead><tbody>';
            if (reportRes.length) {
                reportRes[0].values.forEach(row => {
                    table += `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2].toFixed(2)}</td></tr>`;
                });
            } else {
                table += `<tr><td colspan="3">Нет данных за выбранный период.</td></tr>`;
            }
            table += '</tbody></table>';
            document.getElementById('report-results').innerHTML = table;
        });
    }

    // ... other render functions are unchanged ...
    async function renderOrderDetails(orderId) {
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

        if (canChangeStatus() && o_status !== 'Доставлен') {
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

        if (canManageStock() && o_status !== 'Доставлен') {
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
            const isCourierAndReady = isCourier() && o_status === 'Передан курьеру';
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
        
        if (canChangeStatus() && o_status !== 'Доставлен') {
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

        if (canManageStock() && o_status !== 'Доставлен') {
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
    async function renderCustomers() {
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
    async function renderCustomerDetails(customerId) {
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
    async function renderOrders() {
        const query = showArchived ? 
            `SELECT o.id, c.name, o.order_date, o.status FROM orders o JOIN customers c ON o.customer_id = c.id` :
            `SELECT o.id, c.name, o.order_date, o.status FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.is_archived = 0`;
        const orders = db.exec(query);
        
        let table = '<table><thead><tr><th>ID</th><th>Клиент</th><th>Дата</th><th>Статус</th></tr></thead><tbody>';
        if (orders.length) {
            orders[0].values.forEach(order => {
                table += `<tr><td><a href="#/order/${order[0]}">${order[0]}</a></td><td>${order[1]}</td><td>${order[2]}</td><td>${order[3]}</td></tr>`;
            });
        }
        table += '</tbody></table>';

        let formHtml = '';
        if (canManageStock()) {
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

        if (canManageStock()) {
            document.getElementById('add-order-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                db.run("INSERT INTO orders (customer_id, order_date, status) VALUES (?, ?, 'Новый')", [formData.get('customer_id'), formData.get('order_date')]);
                await router();
            });
        }
    }
    async function renderProducts() {
        const products = db.exec("SELECT id, name, price, stock_quantity FROM products");
        let table = '<table><thead><tr><th>ID</th><th>Название</th><th>Цена</th><th>На складе</th></tr></thead><tbody>';
        if (products.length) {
            products[0].values.forEach(p => {
                table += `<tr><td>${p[0]}</td><td>${p[1]}</td><td>${p[2].toFixed(2)}</td><td>${p[3]}</td></tr>`;
            });
        }
        table += '</tbody></table>';

        let formsHtml = '';
        if (canManageStock()) {
            const productOptions = products.length ? products[0].values.map(p => `<option value="${p[0]}">${p[1]}</option>`).join('') : '';
            formsHtml = `
                <hr><h3>Управление складом</h3>
                <div class="stock-forms" style="display: flex; gap: 20px;">
                    <form id="stock-in-form">
                        <h4>Приход</h4>
                        <select name="product_id" required>${productOptions}</select>
                        <input type="number" name="quantity" min="1" placeholder="Количество" required>
                        <button type="submit">Оприходовать</button>
                    </form>
                    <form id="stock-out-form">
                        <h4>Списание</h4>
                        <select name="product_id" required>${productOptions}</select>
                        <input type="number" name="quantity" min="1" placeholder="Количество" required>
                        <button type="submit">Списать</button>
                    </form>
                </div>
            `;
        }
        content.innerHTML = `<h2>Товары</h2>${table}${formsHtml}`;
        
        if (canManageStock()) {
            document.getElementById('stock-in-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = new FormData(e.target);
                const productId = data.get('product_id');
                const quantity = parseInt(data.get('quantity'));
                db.run("UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?", [quantity, productId]);
                db.run("INSERT INTO stock_movements (product_id, quantity_change, reason, movement_date) VALUES (?, ?, 'приход', ?)", [productId, quantity, new Date().toISOString().slice(0, 10)]);
                await router();
            });

            document.getElementById('stock-out-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = new FormData(e.target);
                const productId = data.get('product_id');
                const quantity = parseInt(data.get('quantity'));
                db.run("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?", [quantity, productId]);
                db.run("INSERT INTO stock_movements (product_id, quantity_change, reason, movement_date) VALUES (?, ?, 'списание', ?)", [productId, -quantity, new Date().toISOString().slice(0, 10)]);
                await router();
            });
        }
    }

    // --- Start the App ---
    init();
});