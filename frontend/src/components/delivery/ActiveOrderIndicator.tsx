import { Badge, Group, Text, Paper, Stack, Button, Box } from '@mantine/core';
import { IconTruck, IconMapPin, IconPackage, IconX, IconChevronUp } from '@tabler/icons-react';
import { useOrders } from '../../features/orders/hooks/useOrders';
import { useAuthStore } from '../../store/authStore';
import { OrderStatus } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';

export function ActiveOrderIndicator() {
  const { data: orders, isLoading } = useOrders();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)') || false;
  
  const isCourier = user?.role.name === 'Курьер';
  
  if (!isCourier || isLoading) {
    return null;
  }

  // Получаем первый активный заказ курьера (со статусом "Передан курьеру")
  const activeOrder = orders?.find(
    (order) => order.status === OrderStatus.TRANSFERRED
  );

  if (!activeOrder) {
    return null;
  }

  const customerAddress = activeOrder.customer.address || 'Адрес не указан';
  const itemsCount = activeOrder.orderItems.length;

  if (isCollapsed) {
    return (
      <Paper
        p="xs"
        radius="md"
        style={{
          position: 'fixed',
          bottom: isMobile ? 12 : 16,
          right: isMobile ? 12 : 16,
          left: isMobile ? 12 : 'auto',
          zIndex: 1000,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        onClick={() => setIsCollapsed(false)}
        bg="orange"
        c="white"
      >
        <Group gap="xs" justify="center">
          <IconTruck size={isMobile ? 18 : 20} />
          <Text size={isMobile ? 'xs' : 'sm'} fw={600}>
            Заказ #{activeOrder.id}
          </Text>
          <IconChevronUp size={isMobile ? 16 : 18} />
        </Group>
      </Paper>
    );
  }

  return (
    <Paper
      p={isMobile ? "sm" : "md"}
      radius="md"
      style={{
        position: 'fixed',
        bottom: isMobile ? 12 : 16,
        right: isMobile ? 12 : 16,
        left: isMobile ? 12 : 'auto',
        zIndex: 1000,
        maxWidth: isMobile ? 'calc(100% - 24px)' : 400,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
      bg="orange"
      c="white"
    >
      <Stack gap={isMobile ? "xs" : "sm"}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <IconTruck size={isMobile ? 20 : 24} />
            <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
              <Text size={isMobile ? "sm" : "lg"} fw={700} truncate>
                Активный заказ
              </Text>
              <Badge 
                size={isMobile ? "sm" : "lg"} 
                variant="filled" 
                color="white" 
                c="orange" 
                mt={4}
                style={{ width: 'fit-content' }}
              >
                Заказ #{activeOrder.id}
              </Badge>
            </Stack>
          </Group>
          <Button
            variant="subtle"
            color="white"
            size="xs"
            p={4}
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(true);
            }}
            style={{ flexShrink: 0 }}
          >
            <IconX size={16} />
          </Button>
        </Group>

        <Stack gap="xs" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: 8 }}>
          <Group gap="xs" align="flex-start" wrap="nowrap">
            <IconPackage size={isMobile ? 16 : 18} style={{ flexShrink: 0, marginTop: 2 }} />
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size={isMobile ? "xs" : "sm"} truncate>
                <Text span fw={600}>Клиент:</Text> {activeOrder.customer.name}
              </Text>
            </Box>
          </Group>

          <Group gap="xs" align="flex-start" wrap="nowrap">
            <IconMapPin size={isMobile ? 16 : 18} style={{ flexShrink: 0, marginTop: 2 }} />
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text 
                size={isMobile ? "xs" : "sm"} 
                style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                <Text span fw={600}>Адрес:</Text> {customerAddress}
              </Text>
            </Box>
          </Group>

          <Group gap="xs">
            <Text size={isMobile ? "xs" : "sm"}>
              <Text span fw={600}>Позиций:</Text> {itemsCount}
            </Text>
          </Group>
        </Stack>

        <Button
          variant="filled"
          color="white"
          c="orange"
          fullWidth
          size={isMobile ? "xs" : "sm"}
          onClick={() => {
            navigate('/');
            setIsCollapsed(true);
          }}
          mt="xs"
        >
          Перейти к заказу
        </Button>
      </Stack>
    </Paper>
  );
}

