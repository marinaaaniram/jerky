// js/ui.js
import { getCurrentUser, logout, hasPermission } from './auth.js';

const navLinks = document.getElementById('nav-links');
const userInfo = document.getElementById('user-info');

export function updateNavigation() {
    navLinks.innerHTML = '';
    if (hasPermission('orders')) navLinks.innerHTML += `<li><a href="#orders">Заказы</a></li>`;
    if (hasPermission('products')) navLinks.innerHTML += `<li><a href="#products">Товары</a></li>`;
    if (hasPermission('customers')) navLinks.innerHTML += `<li><a href="#customers">Клиенты</a></li>`;
    if (hasPermission('reports')) navLinks.innerHTML += `<li><a href="#reports">Отчеты</a></li>`;
}

export function updateUserInfo() {
    const user = getCurrentUser();
    if (!user) {
        userInfo.innerHTML = '';
        return;
    }
    userInfo.innerHTML = `
        <span>${user.name} (${user.role})</span>
        <button id="logout-button">Выйти</button>
    `;
    document.getElementById('logout-button').onclick = logout;
}