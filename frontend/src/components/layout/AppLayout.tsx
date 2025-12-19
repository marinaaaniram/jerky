import { Outlet } from 'react-router-dom';
import { AppShell, Burger, Group, Title, Button, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { GlobalSearch } from '../GlobalSearch';

export function AppLayout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3}>Jerky</Title>
          </Group>
          <GlobalSearch />
          <Group>
            <Text size="sm">{user?.firstName} {user?.lastName}</Text>
            <Button variant="subtle" onClick={handleLogout}>
              Выход
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavbarLinks />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

function NavbarLinks() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const links = [
    { label: 'Панель управления', path: '/', roles: null },
    { label: 'Заказы', path: '/orders', roles: null },
    { label: 'Клиенты', path: '/customers', roles: ['Руководитель', 'Менеджер по продажам'] },
    { label: 'Товары', path: '/products', roles: ['Руководитель', 'Кладовщик'] },
  ];

  const filteredLinks = links.filter((link) => {
    if (!link.roles) return true;
    return link.roles.includes(user?.role.name || '');
  });

  return (
    <>
      {filteredLinks.map((link) => (
        <Button
          key={link.path}
          variant="subtle"
          fullWidth
          justify="start"
          onClick={() => navigate(link.path)}
        >
          {link.label}
        </Button>
      ))}
    </>
  );
}
