import { Badge, Group, Text, Paper, Stack, Button, Box } from '@mantine/core';
import { IconTruck, IconMapPin, IconPackage, IconX, IconChevronUp, IconChevronDown } from '@tabler/icons-react';
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
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)') || false;

  const isCourier = user?.role.name === 'Курьер';

  if (!isCourier || isLoading) {
    return null;
  }

  // Получаем все активные заказы текущего курьера (со статусом "Передан курьеру")
  const courierActiveOrders = orders?.filter(
    (order) => order.status === OrderStatus.TRANSFERRED && order.userId === user?.id
  ) || [];

  if (courierActiveOrders.length === 0) {
    return null;
  }

  const activeOrder = courierActiveOrders[currentOrderIndex];
  const totalActiveOrders = courierActiveOrders.length;

  const handleNextOrder = () => {
    setCurrentOrderIndex((prev) => (prev + 1) % totalActiveOrders);
  };

  const handlePrevOrder = () => {
    setCurrentOrderIndex((prev) => (prev - 1 + totalActiveOrders) % totalActiveOrders);
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
                Активные заказы
              </Text>
              <Group gap={4} mt={4}>
                <Badge
                  size={isMobile ? "sm" : "lg"}
                  variant="filled"
                  color="white"
                  c="orange"
                  style={{ width: 'fit-content' }}
                >
                  Заказ #{activeOrder.id}
                </Badge>
                {totalActiveOrders > 1 && (
                  <Badge
                    size={isMobile ? "xs" : "sm"}
                    variant="light"
                    color="white"
                    c="white"
                    style={{ width: 'fit-content' }}
                  >
                    {currentOrderIndex + 1}/{totalActiveOrders}
                  </Badge>
                )}
              </Group>
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

        {totalActiveOrders > 1 && (
          <Group gap="xs" justify="space-between">
            <Button
              variant="default"
              color="white"
              size={isMobile ? "xs" : "sm"}
              onClick={handlePrevOrder}
              leftSection={<IconChevronUp size={isMobile ? 14 : 16} />}
            >
              Предыдущий
            </Button>
            <Button
              variant="default"
              color="white"
              size={isMobile ? "xs" : "sm"}
              onClick={handleNextOrder}
              rightSection={<IconChevronDown size={isMobile ? 14 : 16} />}
            >
              Следующий
            </Button>
          </Group>
        )}

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

