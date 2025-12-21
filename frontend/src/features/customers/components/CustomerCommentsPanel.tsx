import { useState } from 'react';
import {
  Paper,
  Group,
  Text,
  Button,
  Textarea,
  Stack,
  Avatar,
  ActionIcon,
  Menu,
} from '@mantine/core';
import { IconSend, IconTrash, IconDots } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import { useAuthStore } from '../../../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CustomerCommentsPanelProps {
  customerId: number;
}

export function CustomerCommentsPanel({ customerId }: CustomerCommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: ['customer-comments', customerId],
    queryFn: async () => {
      const response = await apiClient.get(`/customers/${customerId}/comments?page=1&limit=50`);
      return response.data;
    },
    enabled: !!customerId,
  });

  // Add comment
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiClient.post(`/customers/${customerId}/comments`, { content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-comments', customerId] });
      setNewComment('');
    },
  });

  // Delete comment
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiClient.delete(`/customers/${customerId}/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-comments', customerId] });
    },
  });

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addCommentMutation.mutateAsync(newComment);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (confirm('Удалить комментарий?')) {
      await deleteCommentMutation.mutateAsync(commentId);
    }
  };

  const comments = commentsData?.data || [];

  return (
    <Stack gap="md">
      {/* Add comment form */}
      <Paper p="md" radius="md" withBorder>
        <Stack gap="sm">
          <Textarea
            placeholder="Добавьте комментарий..."
            minRows={3}
            maxRows={8}
            value={newComment}
            onChange={(e) => setNewComment(e.currentTarget.value)}
            disabled={addCommentMutation.isPending}
          />
          <Group justify="flex-end">
            <Button
              onClick={handleAddComment}
              loading={addCommentMutation.isPending}
              disabled={!newComment.trim()}
              leftSection={<IconSend size={16} />}
            >
              Отправить
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Comments list */}
      <Stack gap="md">
        {isLoadingComments ? (
          <Text c="dimmed" ta="center">Загрузка комментариев...</Text>
        ) : comments.length === 0 ? (
          <Text c="dimmed" ta="center">Нет комментариев</Text>
        ) : (
          comments.map((comment: Comment) => (
            <Paper key={comment.id} p="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Group>
                  <Avatar
                    name={`${comment.user.firstName} ${comment.user.lastName}`}
                    color="blue"
                    radius="xl"
                  />
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={600}>
                      {comment.user.firstName} {comment.user.lastName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </Text>
                  </div>
                </Group>

                {user?.id === comment.user.id && (
                  <Menu position="bottom-end" shadow="md">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                      >
                        Удалить
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                )}
              </Group>

              <Text>{comment.content}</Text>
            </Paper>
          ))
        )}
      </Stack>
    </Stack>
  );
}
