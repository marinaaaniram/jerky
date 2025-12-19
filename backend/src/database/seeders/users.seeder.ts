import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';

export const seedUsers = async (dataSource: DataSource) => {
  const usersRepository = dataSource.getRepository(User);
  const rolesRepository = dataSource.getRepository(Role);

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
