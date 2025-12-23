import { Avatar, Menu, Group } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export function UserAvatar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Menu position="bottom-end" shadow="md">
      <Menu.Target>
        <Avatar
          color="blue"
          radius="xl"
          size="md"
          name={initials}
          style={{ cursor: 'pointer' }}
        >
          {initials}
        </Avatar>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item disabled>
          <Group gap="xs">
            <Avatar color="blue" radius="xl" size="sm" name={initials}>
              {initials}
            </Avatar>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {user.email}
              </div>
            </div>
          </Group>
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          color="red"
          leftSection={<IconLogout size={16} />}
          onClick={handleLogout}
        >
          Выход
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
