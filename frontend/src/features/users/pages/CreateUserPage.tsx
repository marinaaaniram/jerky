import { Container, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { UserForm } from '../components/UserForm';
import { useCreateUser } from '../hooks/useUsers';

export function CreateUserPage() {
  const navigate = useNavigate();
  const createUser = useCreateUser();

  const handleSubmit = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    roleId: number;
  }) => {
    if (!data.password) {
      return;
    }
    await createUser.mutateAsync({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      roleId: data.roleId,
    });
    navigate('/users');
  };

  return (
    <Container size="md">
      <Title order={2} mb="xl">
        Создать пользователя
      </Title>
      <UserForm
        onSubmit={handleSubmit}
        isLoading={createUser.isPending}
        onCancel={() => navigate('/users')}
      />
    </Container>
  );
}

