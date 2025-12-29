import {
  Container,
  Title,
  Table,
  Button,
  Group,
  LoadingOverlay,
  Text,
  Modal,
  Checkbox,
  Stack,
  SimpleGrid,
  Badge,
  Card,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import {
  useUsers,
  useDeactivateUser,
  useActivateUser,
} from '../hooks/useUsers';
import { TableActionMenu } from '../../../components/TableActionMenu';

export function UsersPage() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { data: users, isLoading, error } = useUsers();
  const deactivateUser = useDeactivateUser();
  const activateUser = useActivateUser();
  const [deactivateId, setDeactivateId] = useState<number | null>(null);
  const [activateId, setActivateId] = useState<number | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  if (error) {
    return (
      <Container>
        <Text c="red">Ошибка загрузки пользователей: {(error as Error).message}</Text>
      </Container>
    );
  }

  const filteredUsers =
    users?.filter((user) => showInactive || user.isActive) || [];

  const handleDeactivateClick = (id: number) => {
    setDeactivateId(id);
    setShowDeactivateModal(true);
  };

  const handleActivateClick = (id: number) => {
    setActivateId(id);
    setShowActivateModal(true);
  };

  const handleConfirmDeactivate = async () => {
    if (deactivateId) {
      await deactivateUser.mutateAsync(deactivateId);
      setShowDeactivateModal(false);
      setDeactivateId(null);
    }
  };

  const handleConfirmActivate = async () => {
    if (activateId) {
      await activateUser.mutateAsync(activateId);
      setShowActivateModal(false);
      setActivateId(null);
    }
  };

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Пользователи</Title>
        <Button onClick={() => navigate('/users/new')}>Добавить пользователя</Button>
      </Group>

      <Stack gap="md" mb="md">
        <Checkbox
          label="Показать неактивных"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.currentTarget.checked)}
        />
      </Stack>

      <div style={{ position: 'relative', minHeight: 200 }}>
        <LoadingOverlay visible={isLoading} />

        {filteredUsers && filteredUsers.length > 0 ? (
          isMobile ? (
            <SimpleGrid cols={1} spacing="md">
              {filteredUsers.map((user) => (
                <Card key={user.id} shadow="sm" padding="lg" withBorder>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text fw={600}>
                        {user.firstName} {user.lastName}
                      </Text>
                      <Badge color={user.isActive ? 'green' : 'red'}>
                        {user.isActive ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {user.email}
                    </Text>
                    <Text size="sm">Роль: {user.role.name}</Text>
                    <Group>
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => navigate(`/users/${user.id}`)}
                      >
                        Редактировать
                      </Button>
                      {user.isActive ? (
                        <Button
                          size="xs"
                          variant="light"
                          color="orange"
                          onClick={() => handleDeactivateClick(user.id)}
                        >
                          Деактивировать
                        </Button>
                      ) : (
                        <Button
                          size="xs"
                          variant="light"
                          color="green"
                          onClick={() => handleActivateClick(user.id)}
                        >
                          Активировать
                        </Button>
                      )}
                    </Group>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Имя</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Роль</Table.Th>
                  <Table.Th>Статус</Table.Th>
                  <Table.Th>Действия</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredUsers.map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      {user.firstName} {user.lastName}
                    </Table.Td>
                    <Table.Td>{user.email}</Table.Td>
                    <Table.Td>{user.role.name}</Table.Td>
                    <Table.Td>
                      <Badge color={user.isActive ? 'green' : 'red'}>
                        {user.isActive ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <TableActionMenu
                        actions={[
                          {
                            label: 'Редактировать',
                            onClick: () => navigate(`/users/${user.id}`),
                          },
                          {
                            label: user.isActive ? 'Деактивировать' : 'Активировать',
                            onClick: () =>
                              user.isActive
                                ? handleDeactivateClick(user.id)
                                : handleActivateClick(user.id),
                            color: user.isActive ? 'orange' : 'green',
                          },
                        ]}
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )
        ) : (
          !isLoading && <Text c="dimmed">Пользователей пока нет</Text>
        )}
      </div>

      <Modal
        opened={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Подтверждение"
      >
        <Text mb="lg">Вы уверены, что хотите деактивировать этого пользователя?</Text>
        <Group justify="flex-start">
          <Button variant="subtle" onClick={() => setShowDeactivateModal(false)}>
            Отмена
          </Button>
          <Button
            color="orange"
            onClick={handleConfirmDeactivate}
            loading={deactivateUser.isPending}
          >
            Деактивировать
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        title="Подтверждение"
      >
        <Text mb="lg">Вы уверены, что хотите активировать этого пользователя?</Text>
        <Group justify="flex-start">
          <Button variant="subtle" onClick={() => setShowActivateModal(false)}>
            Отмена
          </Button>
          <Button
            color="green"
            onClick={handleConfirmActivate}
            loading={activateUser.isPending}
          >
            Активировать
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}

