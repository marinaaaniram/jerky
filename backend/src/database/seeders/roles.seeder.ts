import { DataSource } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

export const seedRoles = async (dataSource: DataSource) => {
  const rolesRepository = dataSource.getRepository(Role);

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
