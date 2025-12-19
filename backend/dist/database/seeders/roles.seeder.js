"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRoles = void 0;
const role_entity_1 = require("../../roles/entities/role.entity");
const seedRoles = async (dataSource) => {
    const rolesRepository = dataSource.getRepository(role_entity_1.Role);
    const roles = [
        { name: 'Руководитель' },
        { name: 'Менеджер по продажам' },
        { name: 'Кладовщик' },
        { name: 'Курьер' },
        { name: 'Наблюдатель' },
    ];
    for (const role of roles) {
        const exists = await rolesRepository.findOne({ where: { name: role.name } });
        if (!exists) {
            await rolesRepository.save(role);
        }
    }
    console.log('✅ Roles seeded successfully');
};
exports.seedRoles = seedRoles;
//# sourceMappingURL=roles.seeder.js.map