// js/router.js
import { hasPermission } from './auth.js';
import { renderOrders } from './views/orders.js';
import { renderOrderDetails } from './views/orderDetails.js';
import { renderCustomers } from './views/customers.js';
import { renderCustomerDetails } from './views/customerDetails.js';
import { renderProducts } from './views/products.js';
import { renderReports } from './views/reports.js';

const content = document.getElementById('content');

export async function router(db) {
    const hash = window.location.hash || '#orders';
    const page = hash.startsWith('#/order/') ? 'order' : (hash.startsWith('#/customer/') ? 'customer' : hash.substring(1) || 'orders');
    
    if (!hasPermission(page)) {
        content.innerHTML = '<h2>Доступ запрещен</h2>';
        return;
    }

    content.innerHTML = '<h2>Загрузка...</h2>';

    const routes = {
        'order': () => renderOrderDetails(db, router, hash.split('/')[2]),
        'customer': () => renderCustomerDetails(db, router, hash.split('/')[2]),
        'orders': () => renderOrders(db, router),
        'products': () => renderProducts(db, router),
        'customers': () => renderCustomers(db, router),
        'reports': () => renderReports(db)
    };

    (routes[page] || routes['orders'])();
}