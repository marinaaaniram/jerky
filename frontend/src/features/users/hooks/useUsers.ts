import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersAPI, rolesAPI } from '../../../api';
import { notifications } from '@mantine/notifications';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: usersAPI.getAll,
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => usersAPI.getOne(id),
    enabled: !!id,
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: rolesAPI.getAll,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      roleId: number;
    }) => usersAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      notifications.show({
        title: 'Успех',
        message: 'Пользователь создан',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось создать пользователя',
        color: 'red',
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        firstName?: string;
        lastName?: string;
        email?: string;
        password?: string;
        roleId?: number;
        isActive?: boolean;
      };
    }) => usersAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      notifications.show({
        title: 'Успех',
        message: 'Пользователь обновлен',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось обновить пользователя',
        color: 'red',
      });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.deactivate,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      notifications.show({
        title: 'Успех',
        message: 'Пользователь деактивирован',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось деактивировать пользователя',
        color: 'red',
      });
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.activate,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      notifications.show({
        title: 'Успех',
        message: 'Пользователь активирован',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Ошибка',
        message: error.response?.data?.message || 'Не удалось активировать пользователя',
        color: 'red',
      });
    },
  });
};

