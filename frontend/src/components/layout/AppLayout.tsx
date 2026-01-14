import { Outlet, useLocation } from 'react-router-dom';
import { AppShell, Burger, Group, Title, Button, Stack, Box } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { GlobalSearch } from '../GlobalSearch';
import { PWAInstallButton } from '../PWAInstallButton';
import { UserAvatar } from '../UserAvatar';
import { MobileSearch } from '../MobileSearch';
import { ActiveOrderIndicator } from '../delivery/ActiveOrderIndicator';
import {
  IconDashboard,
  IconShoppingCart,
  IconUsers,
  IconPackage,
  IconClipboardList,
  IconChartBar,
  IconUserCog,
} from '@tabler/icons-react';

export function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)') || false;


  return (
    <AppShell
      header={{ height: isMobile ? 60 : 70 }}
      navbar={{ width: isMobile ? 280 : 300, breakpoint: 'md', collapsed: { mobile: !opened } }}
      padding={{ top: 0, bottom: 'md', left: 'md', right: 'md' }}
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
              size={isMobile ? 'h5' : 'h3'}
              fw={700}
              style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              onClick={() => {
                navigate('/');
                if (isMobile) close();
              }}
            >
              ⚡ Jerky
            </Title>
          </Group>

          <Box visibleFrom="xs" style={{ flex: 1, minWidth: 0 }}>
            <GlobalSearch />
          </Box>

          <Group gap="xs" h="100%" wrap="nowrap">
            <Box visibleFrom="xs">
              <PWAInstallButton />
            </Box>

            <Box hiddenFrom="xs">
              <MobileSearch />
            </Box>

            <UserAvatar />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavbarLinks currentPath={location.pathname} onNavigate={close} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
        <ActiveOrderIndicator />
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
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const links: NavbarLink[] = [
    { label: 'Панель управления', path: '/dashboards', icon: <IconDashboard size={20} />, roles: ['Руководитель', 'Менеджер по продажам', 'Кладовщик', 'Наблюдатель'] },
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
    {
      label: 'Управление пользователями',
      path: '/users',
      icon: <IconUserCog size={20} />,
      roles: ['Руководитель'],
    },
  ];

  const filteredLinks = links.filter((link) => {
    if (!link.roles) return true;
    return link.roles.includes(user?.role.name || '');
  });

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

  return (
    <Stack gap="md">
      {filteredLinks.map((link) => (
        <Button
          key={link.path}
          onClick={() => {
            navigate(link.path);
            onNavigate();
          }}
          variant={isActive(link.path) ? 'filled' : 'light'}
          color={isActive(link.path) ? 'blue' : 'gray'}
          fullWidth
          justify="flex-start"
          leftSection={link.icon}
          fw={isActive(link.path) ? 600 : 500}
          size="md"
          py="sm"
          aria-current={isActive(link.path) ? 'page' : undefined}
        >
          {link.label}
        </Button>
      ))}
    </Stack>
  );
}
