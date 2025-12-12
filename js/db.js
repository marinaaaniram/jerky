// js/db.js
import { populateDbWithFakeData } from './populate_db.js';

const DB_KEY = 'jerky_app_db';

function populate(db) {
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
}

export function saveDatabase(db) {
    const data = db.export();
    const buffer = new Uint8Array(data);
    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(buffer[i]);
    }
    const base64 = btoa(binary);
    localStorage.setItem(DB_KEY, base64);
    console.log("Database saved to localStorage.");
}

export async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    let db;
    const storedData = localStorage.getItem(DB_KEY);

    if (storedData) {
        try {
            const buffer = Uint8Array.from(atob(storedData), c => c.charCodeAt(0));
            db = new SQL.Database(buffer);
            console.log("Database loaded from localStorage.");
        } catch (e) {
            console.error("Failed to load database from localStorage, creating new one:", e);
            db = new SQL.Database();
            populate(db);
            populateDbWithFakeData(db);
            saveDatabase(db); // Save the newly populated database
        }
    } else {
        console.log("No database found in localStorage, creating new one.");
        db = new SQL.Database();
        populate(db);
        populateDbWithFakeData(db);
        saveDatabase(db); // Save the newly populated database
    }

    return db;
}