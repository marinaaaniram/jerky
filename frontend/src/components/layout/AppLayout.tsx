import { Outlet, useLocation } from 'react-router-dom';
import { AppShell, Burger, Group, Title, Button, Text, ActionIcon, Tooltip, Stack } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { GlobalSearch } from '../GlobalSearch';
import { PWAInstallButton } from '../PWAInstallButton';
import {
  IconDashboard,
  IconShoppingCart,
  IconUsers,
  IconPackage,
  IconClipboardList,
  IconChartBar,
  IconLogout,
} from '@tabler/icons-react';

export function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)') || false;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: isMobile ? 60 : 70 }}
      navbar={{ width: isMobile ? 280 : 300, breakpoint: 'md', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header p="md">
        <Group justify="space-between" h="100%" wrap="nowrap">
          <Group gap="xs" h="100%">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="md"
              size="sm"
              aria-label={opened ? 'Закрыть навигацию' : 'Открыть навигацию'}
            />
            <Title
              order={3}
              size={isMobile ? 'h4' : 'h3'}
              fw={700}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                navigate('/');
                if (isMobile) close();
              }}
            >
              ⚡ Jerky
            </Title>
          </Group>

          <GlobalSearch />

          <Group gap="xs" h="100%" wrap="nowrap">
            <PWAInstallButton />

            <Text
              size="sm"
              fw={500}
              hiddenFrom="xs"
              truncate
              title={`${user?.firstName} ${user?.lastName}`}
            >
              {user?.firstName}
            </Text>

            <Tooltip label="Выход">
              <ActionIcon
                onClick={handleLogout}
                variant="subtle"
                color="gray"
                aria-label="Выход из аккаунта"
              >
                <IconLogout size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavbarLinks isMobile={isMobile} currentPath={location.pathname} onNavigate={close} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

interface NavbarLink {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[] | null;
}

function NavbarLinks({
  isMobile,
  currentPath,
  onNavigate,
}: {
  isMobile: boolean;
  currentPath: string;
  onNavigate: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const links: NavbarLink[] = [
    { label: 'Панель управления', path: '/', icon: <IconDashboard size={20} />, roles: null },
    { label: 'Заказы', path: '/orders', icon: <IconShoppingCart size={20} />, roles: null },
    {
      label: 'Клиенты',
      path: '/customers',
      icon: <IconUsers size={20} />,
      roles: ['Руководитель', 'Менеджер по продажам'],
    },
    {
      label: 'Товары',
      path: '/products',
      icon: <IconPackage size={20} />,
      roles: ['Руководитель', 'Кладовщик'],
    },
    {
      label: 'Инвентаризация',
      path: '/inventory-check',
      icon: <IconClipboardList size={20} />,
      roles: ['Руководитель', 'Кладовщик'],
    },
    {
      label: 'Аналитика',
      path: '/analytics/sales',
      icon: <IconChartBar size={20} />,
      roles: ['Руководитель', 'Менеджер по продажам'],
    },
  ];

  const filteredLinks = links.filter((link) => {
    if (!link.roles) return true;
    return link.roles.includes(user?.role.name || '');
  });

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

  return (
    <Stack gap={isMobile ? 'xs' : 'sm'}>
      {filteredLinks.map((link) =>
        isMobile ? (
          <Tooltip key={link.path} label={link.label} position="right">
            <ActionIcon
              onClick={() => {
                navigate(link.path);
                onNavigate();
              }}
              variant={isActive(link.path) ? 'light' : 'subtle'}
              color={isActive(link.path) ? 'blue' : 'gray'}
              size="lg"
              radius="md"
              aria-label={link.label}
              title={link.label}
            >
              {link.icon}
            </ActionIcon>
          </Tooltip>
        ) : (
          <Button
            key={link.path}
            onClick={() => {
              navigate(link.path);
              onNavigate();
            }}
            variant={isActive(link.path) ? 'light' : 'subtle'}
            color={isActive(link.path) ? 'blue' : 'gray'}
            fullWidth
            justify="flex-start"
            leftSection={link.icon}
            fw={isActive(link.path) ? 600 : 500}
            aria-current={isActive(link.path) ? 'page' : undefined}
          >
            {link.label}
          </Button>
        )
      )}
    </Stack>
  );
}
