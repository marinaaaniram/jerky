import { Container, Title, Text } from '@mantine/core';
import { useAuthStore } from '../store/authStore';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <Container>
      <Title>Панель управления</Title>
      <Text mt="md">
        Добро пожаловать, {user?.firstName} {user?.lastName}!
      </Text>
      <Text>Роль: {user?.role.name}</Text>
    </Container>
  );
}
