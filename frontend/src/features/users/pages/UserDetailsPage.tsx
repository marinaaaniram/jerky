import { Container, Title, LoadingOverlay, Text } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { UserForm } from '../components/UserForm';
import { useUser, useUpdateUser } from '../hooks/useUsers';

export function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = id ? parseInt(id) : 0;
  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();

  const handleSubmit = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    roleId: number;
  }) => {
    await updateUser.mutateAsync({
      id: userId,
      data,
    });
    navigate('/users');
  };

  if (error) {
    return (
      <Container>
        <Text c="red">Ошибка загрузки пользователя: {(error as Error).message}</Text>
      </Container>
    );
  }

  return (
    <Container size="md" style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />
      <Title order={2} mb="xl">
        Редактировать пользователя
      </Title>
      {user && (
        <UserForm
          initialData={user}
          onSubmit={handleSubmit}
          isLoading={updateUser.isPending}
          onCancel={() => navigate('/users')}
        />
      )}
    </Container>
  );
}

