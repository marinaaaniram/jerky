import {
  Card,
  Button,
  Group,
  Stack,
  TextInput,
  Select,
  PasswordInput,
} from '@mantine/core';
import { useState } from 'react';
import type { User, Role } from '../../../types';
import { useRoles } from '../hooks/useUsers';

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    roleId: number;
  }) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function UserForm({
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
}: UserFormProps) {
  const { data: roles } = useRoles();
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<string | null>(
    initialData?.role?.id?.toString() || null
  );

  const handleSubmit = async () => {
    if (!roleId) return;
    await onSubmit({
      firstName,
      lastName,
      email,
      password: initialData ? (password || undefined) : password,
      roleId: parseInt(roleId),
    });
  };

  const isValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    roleId &&
    (initialData || password.length >= 6);

  const roleOptions =
    roles?.map((role: Role) => ({
      value: role.id.toString(),
      label: role.name,
    })) || [];

  return (
    <Card shadow="sm" padding="lg">
      <Stack gap="md">
        <TextInput
          label="Имя"
          placeholder="Введите имя"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          disabled={isLoading}
        />

        <TextInput
          label="Фамилия"
          placeholder="Введите фамилию"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          disabled={isLoading}
        />

        <TextInput
          label="Email"
          placeholder="Введите email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />

        <PasswordInput
          label={initialData ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль'}
          placeholder={initialData ? 'Введите новый пароль' : 'Введите пароль'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!initialData}
          disabled={isLoading}
          minLength={6}
        />

        <Select
          label="Роль"
          placeholder="Выберите роль"
          value={roleId}
          onChange={setRoleId}
          data={roleOptions}
          required
          disabled={isLoading}
        />

        <Group justify="flex-start" mt="md">
          <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} loading={isLoading} disabled={!isValid}>
            {initialData ? 'Сохранить' : 'Создать'}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}

