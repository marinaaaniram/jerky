// js/views/products.js
import { canManageStock } from '../auth.js';

export async function renderProducts(db, router) {
    const content = document.getElementById('content');

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