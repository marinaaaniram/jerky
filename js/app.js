// js/app.js
import { getCurrentUser, setCurrentUser } from './auth.js';
import { updateNavigation, updateUserInfo } from './ui.js';
import { router } from './router.js';
import { initDatabase } from './db.js';

let db;

async function showLogin() {
    const loginModal = document.getElementById('login-modal');
    const userSelect = document.getElementById('user-select');
    const loginButton = document.getElementById('login-button');

    loginModal.style.display = 'flex';
    const usersRes = db.exec("SELECT u.id, u.name, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id");
    if (usersRes.length) {
        userSelect.innerHTML = usersRes[0].values.map(user => 
            `<option value="${user[0]}">${user[1]} (${user[2]})</option>`
        ).join('');
    }

    loginButton.onclick = async () => {
        const userId = userSelect.value;
        const userRes = db.exec(`SELECT u.id, u.name, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ${userId}`);
        const user = userRes[0].values[0];
        setCurrentUser({ id: user[0], name: user[1], role: user[2] });
        await showApp();
    };
}

async function showApp() {
    document.getElementById('login-modal').style.display = 'none';
    document.querySelector('header').style.display = 'flex';
    document.querySelector('main').style.display = 'block';
    window.addEventListener('hashchange', () => router(db));
    await updateNavigation();
    await updateUserInfo();
    router(db); // Initial route
}

async function main() {
    db = await initDatabase();

    if (await getCurrentUser()) {
        await showApp();
    } else {
        await showLogin();
    }
}

main();