// js/auth.js

let currentUser = null;

const rolePermissions = {
    'Руководитель': ['orders', 'products', 'customers', 'reports', 'customer', 'order'],
    'Менеджер по продажам': ['orders', 'customers', 'reports', 'customer', 'order'],
    'Кладовщик': ['orders', 'products', 'order'],
    'Курьер': ['orders', 'order'],
    'Наблюдатель': ['orders', 'products', 'customers', 'reports', 'customer', 'order']
};

export function getCurrentUser() {
    if (!currentUser) {
        const userData = sessionStorage.getItem('currentUser');
        if (userData) {
            currentUser = JSON.parse(userData);
        }
    }
    return currentUser;
}

export function setCurrentUser(user) {
    currentUser = user;
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

export function logout() {
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    window.location.hash = '';
    window.location.reload();
}

export function hasPermission(page) {
    const user = getCurrentUser();
    if (!user) return false;
    const permissions = rolePermissions[user.role] || [];
    return permissions.includes(page);
}

export function canEdit() {
    const user = getCurrentUser();
    if (!user) return false;
    return ['Руководитель', 'Менеджер по продажам'].includes(user.role);
}

export function canManageStock() {
    const user = getCurrentUser();
    if (!user) return false;
    return ['Руководитель', 'Кладовщик'].includes(user.role);
}

export function canChangeStatus() {
    const user = getCurrentUser();
    if (!user) return false;
    return ['Руководитель', 'Кладовщик', 'Курьер'].includes(user.role);
}

export function isCourier() {
    const user = getCurrentUser();
    if (!user) return false;
    return user.role === 'Курьер';
}