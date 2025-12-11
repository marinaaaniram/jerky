const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('../models'); // Импортируем настроенный Sequelize и модели

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Пример API-эндпоинта для получения всех заказов
app.get('/api/orders', async (req, res) => {
    try {
        // Используем модель Order для получения всех заказов
        // Включаем модель Customer, чтобы получить имя клиента
        const orders = await db.Order.findAll({
            include: [{
                model: db.Customer,
                as: 'customer', // Убедитесь, что это соответствует ассоциации в модели Order
                attributes: ['name']
            }],
            order: [['order_date', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: error.message });
    }
});

// Пример API-эндпоинта для обновления статуса заказа
app.put('/api/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const [updatedRows] = await db.Order.update(
            { status: status },
            { where: { id: id } }
        );
        if (updatedRows > 0) {
            res.json({ message: `Order ${id} status updated to ${status}`, changes: updatedRows });
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Запуск сервера и синхронизация базы данных
db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
