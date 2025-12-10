// js/views/reports.js

export async function renderReports(db) {
    const content = document.getElementById('content');

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