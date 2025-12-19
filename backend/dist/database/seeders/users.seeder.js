"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = void 0;
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../../users/entities/user.entity");
const role_entity_1 = require("../../roles/entities/role.entity");
const seedUsers = async (dataSource) => {
    const usersRepository = dataSource.getRepository(user_entity_1.User);
    const rolesRepository = dataSource.getRepository(role_entity_1.Role);
    const roles = await rolesRepository.find();
    const roleMap = roles.reduce((acc, role) => {
        acc[role.name] = role.id;
        return acc;
    }, {});
    const users = [
        {
            firstName: 'Иван',
            lastName: 'Руководитель',
            email: 'ivan@jerky.com',
            password: 'password123',
            roleId: roleMap['Руководитель'],
        },
        {
            firstName: 'Петр',
            lastName: 'Менеджер',
            email: 'petr@jerky.com',
            password: 'password123',
            roleId: roleMap['Менеджер по продажам'],
        },
        {
            firstName: 'Сергей',
            lastName: 'Кладовщик',
            email: 'sergey@jerky.com',
            password: 'password123',
            roleId: roleMap['Кладовщик'],
        },
        {
            firstName: 'Алексей',
            lastName: 'Курьер',
            email: 'alexey@jerky.com',
            password: 'password123',
            roleId: roleMap['Курьер'],
        },
        {
            firstName: 'Мария',
            lastName: 'Наблюдатель',
            email: 'maria@jerky.com',
            password: 'password123',
            roleId: roleMap['Наблюдатель'],
        },
    ];
    for (const user of users) {
        const exists = await usersRepository.findOne({ where: { email: user.email } });
        if (!exists) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await usersRepository.save({
                ...user,
                password: hashedPassword,
            });
        }
    }
    console.log('✅ Users seeded successfully');
    console.log('   Default password for all users: password123');
};
exports.seedUsers = seedUsers;
//# sourceMappingURL=users.seeder.js.map