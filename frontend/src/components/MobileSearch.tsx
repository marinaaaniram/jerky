import { useState, useCallback } from 'react';
import { Modal, TextInput, Stack, Group, Text, ActionIcon, Loader, Paper, Badge, Flex, useMantineTheme } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { searchAPI, type SearchResult } from '../api/search';

const statusColors: Record<string, string> = {
  'Новый': 'gray',
  'В сборке': 'yellow',
  'Передан курьеру': 'orange',
  'Доставлен': 'green',
};

export function MobileSearch() {
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useMantineTheme();

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await searchAPI.globalSearch(searchQuery, 10);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    handleSearch(value);
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    handleClose();
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setOpened(false);
  };

  const groupedResults = {
    orders: results.filter((r) => r.type === 'order'),
    customers: results.filter((r) => r.type === 'customer'),
    products: results.filter((r) => r.type === 'product'),
  };

  return (
    <>
      <ActionIcon
        onClick={() => setOpened(true)}
        variant="subtle"
        aria-label="Поиск"
      >
        <IconSearch size={20} />
      </ActionIcon>

      <Modal opened={opened} onClose={handleClose} fullScreen={true} padding={0} withCloseButton={false}>
        <Stack gap="md" p="md" h="100%">
          <Group gap="xs">
            <TextInput
              placeholder="Поиск по заказам, клиентам, товарам..."
              value={query}
              onChange={(e) => handleInputChange(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              rightSection={
                query ? (
                  <ActionIcon size="xs" color="gray" radius="xl" variant="transparent" onClick={() => setQuery('')}>
                    <IconX size={14} />
                  </ActionIcon>
                ) : loading ? (
                  <Loader size={16} />
                ) : null
              }
              size="md"
              radius="md"
              autoFocus
              style={{ flex: 1 }}
            />
            <ActionIcon onClick={handleClose} variant="subtle">
              <IconX size={20} />
            </ActionIcon>
          </Group>

          {results.length > 0 ? (
            <Stack gap="xs" style={{ overflowY: 'auto', flex: 1 }}>
              {/* Orders */}
              {groupedResults.orders.length > 0 && (
                <>
                  <Text size="sm" fw={600} c="gray">
                    Заказы
                  </Text>
                  {groupedResults.orders.map((result) => (
                    <Paper
                      key={`order-${result.id}`}
                      p="sm"
                      radius="md"
                      style={{
                        border: `1px solid ${theme.colors.gray[2]}`,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleResultClick(result)}
                    >
                      <Flex justify="space-between" align="center">
                        <Text size="sm">{result.title}</Text>
                        {result.status && (
                          <Badge size="sm" color={statusColors[result.status] || 'gray'}>
                            {result.status}
                          </Badge>
                        )}
                      </Flex>
                    </Paper>
                  ))}
                </>
              )}

              {/* Customers */}
              {groupedResults.customers.length > 0 && (
                <>
                  <Text size="sm" fw={600} c="gray">
                    Клиенты
                  </Text>
                  {groupedResults.customers.map((result) => (
                    <Paper
                      key={`customer-${result.id}`}
                      p="sm"
                      radius="md"
                      style={{
                        border: `1px solid ${theme.colors.gray[2]}`,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleResultClick(result)}
                    >
                      <Text size="sm">{result.title}</Text>
                    </Paper>
                  ))}
                </>
              )}

              {/* Products */}
              {groupedResults.products.length > 0 && (
                <>
                  <Text size="sm" fw={600} c="gray">
                    Товары
                  </Text>
                  {groupedResults.products.map((result) => (
                    <Paper
                      key={`product-${result.id}`}
                      p="sm"
                      radius="md"
                      style={{
                        border: `1px solid ${theme.colors.gray[2]}`,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleResultClick(result)}
                    >
                      <Text size="sm">{result.title}</Text>
                    </Paper>
                  ))}
                </>
              )}
            </Stack>
          ) : query && !loading ? (
            <Text c="gray" ta="center">
              Ничего не найдено
            </Text>
          ) : null}
        </Stack>
      </Modal>
    </>
  );
}
