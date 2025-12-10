// js/ui.js
import { getCurrentUser, logout, hasPermission } from './auth.js';

const navLinks = document.getElementById('nav-links');
const userInfo = document.getElementById('user-info');

export async function updateNavigation() {
    navLinks.innerHTML = '';
    if (await hasPermission('orders')) navLinks.innerHTML += `<li><a href="#orders">Заказы</a></li>`;
    if (await hasPermission('products')) navLinks.innerHTML += `<li><a href="#products">Товары</a></li>`;
    if (await hasPermission('customers')) navLinks.innerHTML += `<li><a href="#customers">Клиенты</a></li>`;
    if (await hasPermission('reports')) navLinks.innerHTML += `<li><a href="#reports">Отчеты</a></li>`;
}

export async function updateUserInfo() {
    const user = await getCurrentUser();
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