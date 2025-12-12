import { faker } from 'https://cdn.skypack.dev/@faker-js/faker';

export function populateDbWithFakeData(db) {
    const customerIds = [];
    for (let i = 0; i < 50; i++) {
        const customerName = faker.company.name();
        const customerAddress = faker.location.streetAddress();
        const customerPhone = faker.phone.number();
        const paymentType = faker.helpers.arrayElement(['прямые', 'реализация']);
        const customerDebt = faker.datatype.boolean() ? faker.finance.amount(0, 1000, 2) : 0;
        const isArchived = faker.datatype.boolean(0.1);
        db.run(
            "INSERT INTO customers (name, address, phone, payment_type, debt, is_archived) VALUES (?, ?, ?, ?, ?, ?)",
            [customerName, customerAddress, customerPhone, paymentType, customerDebt, isArchived]
        );
        customerIds.push(db.exec("SELECT last_insert_rowid()")[0].values[0][0]);
    }

    const productIds = [];
    for (let i = 0; i < 20; i++) {
        const productName = faker.commerce.productName();
        const productPrice = faker.commerce.price(1, 200, 2);
        const stockQuantity = faker.number.int({ min: 0, max: 1000 });
        db.run(
            "INSERT INTO products (name, price, stock_quantity) VALUES (?, ?, ?)",
            [productName, productPrice, stockQuantity]
        );
        productIds.push(db.exec("SELECT last_insert_rowid()")[0].values[0][0]);
    }

    const roles = ['Руководитель', 'Менеджер по продажам', 'Кладовщик', 'Курьер', 'Наблюдатель'];
    const userIds = [];
    roles.forEach(role => {
        const roleIdQuery = db.exec("SELECT id FROM roles WHERE name = ?", [role]);
        const roleId = roleIdQuery.length > 0 ? roleIdQuery[0].values[0][0] : null;
        if (roleId) {
            for (let i = 0; i < 2; i++) { // 2 users per role
                const userName = faker.person.fullName();
                db.run(
                    "INSERT INTO users (name, role_id) VALUES (?, ?)",
                    [userName, roleId]
                );
                userIds.push(db.exec("SELECT last_insert_rowid()")[0].values[0][0]);
            }
        }
    });

    for (let i = 0; i < 1000; i++) {
        const customerId = faker.helpers.arrayElement(customerIds);
        const productId = faker.helpers.arrayElement(productIds);

        // Order
        const orderDate = faker.date.past().toISOString().slice(0, 19).replace('T', ' ');
        const orderStatus = faker.helpers.arrayElement(['Новый', 'В обработке', 'Доставлен', 'Отменен']);
        db.run(
            "INSERT INTO orders (customer_id, order_date, status) VALUES (?, ?, ?)",
            [customerId, orderDate, orderStatus]
        );
        const orderId = db.exec("SELECT last_insert_rowid()")[0].values[0][0];

        // Order Items
        const numItems = faker.number.int({ min: 1, max: 5 });
        for (let j = 0; j < numItems; j++) {
            const orderProductId = faker.helpers.arrayElement(productIds);
            const productPriceQuery = db.exec("SELECT price FROM products WHERE id = ?", [orderProductId]);
            const productPrice = productPriceQuery.length > 0 ? productPriceQuery[0].values[0][0] : 0;
            const quantity = faker.number.int({ min: 1, max: 10 });
            db.run(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
                [orderId, orderProductId, quantity, productPrice]
            );
        }

        // Payment
        if (faker.datatype.boolean()) {
            const paymentAmount = faker.finance.amount(10, 500, 2);
            const paymentDate = faker.date.past().toISOString().slice(0, 19).replace('T', ' ');
            db.run(
                "INSERT INTO payments (customer_id, amount, payment_date) VALUES (?, ?, ?)",
                [customerId, paymentAmount, paymentDate]
            );
        }

        // Stock Movement
        if (faker.datatype.boolean(0.3)) {
            const quantityChange = faker.number.int({ min: -50, max: 50 });
            const reason = faker.lorem.sentence();
            const movementDate = faker.date.past().toISOString().slice(0, 19).replace('T', ' ');
            db.run(
                "INSERT INTO stock_movements (product_id, quantity_change, reason, movement_date) VALUES (?, ?, ?, ?)",
                [productId, quantityChange, reason, movementDate]
            );
        }

        // Price Rule
        if (faker.datatype.boolean(0.1)) {
            const specialPrice = faker.commerce.price(1, 180, 2);
            const existingRule = db.exec("SELECT id FROM price_rules WHERE customer_id = ? AND product_id = ?", [customerId, productId]);
            if (existingRule.length === 0) {
                db.run(
                    "INSERT INTO price_rules (customer_id, product_id, special_price) VALUES (?, ?, ?)",
                    [customerId, productId, specialPrice]
                );
            }
        }
    }
}
