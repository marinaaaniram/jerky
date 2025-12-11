const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000; // Вы можете выбрать любой свободный порт

// Middleware
app.use(cors()); // Разрешаем CORS для всех запросов
app.use(express.json()); // Для парсинга JSON-тел запросов

// Инициализация базы данных SQLite
// База данных будет храниться в файле jerky.db в корневой папке бэкенда
const dbPath = path.resolve(__dirname, 'jerky.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Создаем таблицы и заполняем их данными, если база данных пуста
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='customers'", (err, row) => {
            if (err) {
                console.error('Error checking for tables:', err.message);
            } else if (!row) {
                console.log('Database is empty, populating with initial data...');
                populateDatabase(db);
            }
        });
    }
});

// Функция для создания таблиц и заполнения начальными данными
function populateDatabase(db) {
    db.serialize(() => {
        // --- Table Definitions ---
        db.run(`CREATE TABLE customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, address TEXT, phone TEXT, payment_type TEXT DEFAULT 'прямые', debt REAL DEFAULT 0, is_archived INTEGER DEFAULT 0);`);
        db.run(`CREATE TABLE payments (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER, amount REAL, payment_date TEXT, FOREIGN KEY (customer_id) REFERENCES customers (id));`);
        db.run(`CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, stock_quantity INTEGER DEFAULT 0);`);
        db.run(`CREATE TABLE stock_movements (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER, quantity_change INTEGER, reason TEXT, movement_date TEXT, FOREIGN KEY (product_id) REFERENCES products (id));`);
        db.run(`CREATE TABLE orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER, order_date TEXT, status TEXT, FOREIGN KEY (customer_id) REFERENCES customers (id));`);
        db.run(`CREATE TABLE order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER, product_id INTEGER, quantity INTEGER, price REAL, FOREIGN KEY (order_id) REFERENCES orders (id), FOREIGN KEY (product_id) REFERENCES products (id));`);
        db.run(`CREATE TABLE roles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE);`);
        db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, role_id INTEGER, FOREIGN KEY (role_id) REFERENCES roles (id));`);
        db.run(`CREATE TABLE price_rules (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER, product_id INTEGER, special_price REAL, FOREIGN KEY (customer_id) REFERENCES customers (id), FOREIGN KEY (product_id) REFERENCES products (id), UNIQUE(customer_id, product_id));`);
        db.run(`CREATE TABLE delivery_surveys (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER UNIQUE, photo_url TEXT, stock_check_notes TEXT, layout_notes TEXT, other_notes TEXT, timestamp TEXT, FOREIGN KEY (order_id) REFERENCES orders (id));`);

        // --- Data Population ---
        const roles = ['Руководитель', 'Менеджер по продажам', 'Кладовщик', 'Курьер', 'Наблюдатель'];
        roles.forEach(role => { db.run("INSERT INTO roles (name) VALUES (?)", [role]); });

        db.run("INSERT INTO users (name, role_id) VALUES ('Иван Руководитель', 1)");
        db.run("INSERT INTO users (name, role_id) VALUES ('Петр Менеджер', 2)");
        db.run("INSERT INTO users (name, role_id) VALUES ('Сергей Кладовщик', 3)");
        db.run("INSERT INTO users (name, role_id) VALUES ('Алексей Курьер', 4)");
        db.run("INSERT INTO users (name, role_id) VALUES ('Мария Наблюдатель', 5)");

        db.run("INSERT INTO customers (name, address, phone, payment_type, debt, is_archived) VALUES ('Точка А (Прямые)', 'ул. Первая, 1', '111-111-1111', 'прямые', 0, 0)");
        db.run("INSERT INTO customers (name, address, phone, payment_type, debt, is_archived) VALUES ('Точка Б (Реализация)', 'ул. Вторая, 2', '222-222-2222', 'реализация', 150.50, 0)");
        db.run("INSERT INTO customers (name, address, phone, payment_type, debt, is_archived) VALUES ('Точка В (Архив)', 'ул. Архивная, 3', '333-333-3333', 'прямые', 0, 1)");

        db.run("INSERT INTO products (name, price, stock_quantity) VALUES ('Товар 1', 10.00, 100)");
        db.run("INSERT INTO products (name, price, stock_quantity) VALUES ('Товар 2', 20.00, 50)");

        db.run("INSERT INTO price_rules (customer_id, product_id, special_price) VALUES (2, 1, 9.50)");

        // Здесь можно добавить вызов populateDbWithFakeData, если он у вас есть и вы хотите его использовать на бэкенде
        // require('./populate_db_backend')(db); // Предполагая, что вы адаптируете populate_db.js для Node.js
    });
}

// Пример API-эндпоинта для получения всех заказов
app.get('/api/orders', (req, res) => {
    const query = `SELECT o.id, c.name as customer_name, o.order_date, o.status FROM orders o JOIN customers c ON o.customer_id = c.id ORDER BY o.order_date DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Пример API-эндпоинта для обновления статуса заказа
app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: `Order ${id} status updated to ${status}`, changes: this.changes });
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});