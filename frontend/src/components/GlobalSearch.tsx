import { useState, useCallback } from 'react';
import { TextInput, Paper, Group, Text, ActionIcon, Loader, Stack, Badge, Flex, useMantineTheme } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { searchAPI, type SearchResult } from '../api/search';

const statusColors: Record<string, string> = {
  'Новый': 'gray',
  'В сборке': 'yellow',
  'Передан курьеру': 'orange',
  'Доставлен': 'green',
};

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const theme = useMantineTheme();

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setOpened(false);
      return;
    }

    setLoading(true);
    try {
      const data = await searchAPI.globalSearch(searchQuery, 10);
      setResults(data);
      setOpened(true);
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
    setQuery('');
    setResults([]);
    setOpened(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpened(false);
  };

  const handleInputBlur = () => {
    setTimeout(() => setOpened(false), 200);
  };

  const groupedResults = {
    orders: results.filter((r) => r.type === 'order'),
    customers: results.filter((r) => r.type === 'customer'),
    products: results.filter((r) => r.type === 'product'),
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: 500 }}>
      <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
        <TextInput
          placeholder="Поиск по заказам, клиентам, товарам..."
          value={query}
          onChange={(e) => handleInputChange(e.currentTarget.value)}
          onFocus={() => query.length >= 2 && setOpened(true)}
          onBlur={handleInputBlur}
          leftSection={<IconSearch size={16} />}
          rightSection={
            query ? (
              <ActionIcon size="xs" color="gray" radius="xl" variant="transparent" onClick={handleClear}>
                <IconX size={14} />
              </ActionIcon>
            ) : loading ? (
              <Loader size={16} />
            ) : null
          }
          size="sm"
          radius="md"
        />

        {opened && results.length > 0 && (
          <Paper
            shadow="md"
            p="xs"
            radius="md"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              marginTop: 4,
              boxShadow: theme.shadows.md,
              border: `1px solid ${theme.colors.gray[2]}`,
            }}
          >
            <Stack gap="xs" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {/* Orders Section */}
              {groupedResults.orders.length > 0 && (
                <>
                  {groupedResults.orders.map((result) => (
                    <SearchResultItem
                      key={`${result.type}-${result.id}`}
                      result={result}
                      onClick={() => handleResultClick(result)}
                      theme={theme}
                    />
                  ))}
                </>
              )}

              {/* Customers Section */}
              {groupedResults.customers.length > 0 && (
                <>
                  {groupedResults.customers.map((result) => (
                    <SearchResultItem
                      key={`${result.type}-${result.id}`}
                      result={result}
                      onClick={() => handleResultClick(result)}
                      theme={theme}
                    />
                  ))}
                </>
              )}

              {/* Products Section */}
              {groupedResults.products.length > 0 && (
                <>
                  {groupedResults.products.map((result) => (
                    <SearchResultItem
                      key={`${result.type}-${result.id}`}
                      result={result}
                      onClick={() => handleResultClick(result)}
                      theme={theme}
                    />
                  ))}
                </>
              )}
            </Stack>
          </Paper>
        )}

        {opened && results.length === 0 && !loading && query.length >= 2 && (
          <Paper
            shadow="md"
            p="md"
            radius="md"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              marginTop: 4,
              textAlign: 'center',
              boxShadow: theme.shadows.md,
              border: `1px solid ${theme.colors.gray[2]}`,
            }}
          >
            <Text size="sm" c="dimmed">
              Результаты не найдены
            </Text>
          </Paper>
        )}
      </div>
    </div>
  );
}

interface SearchResultItemProps {
  result: SearchResult;
  onClick: () => void;
  theme?: any;
}

function SearchResultItem({ result, onClick, theme: injectedTheme }: SearchResultItemProps) {
  const theme = injectedTheme || useMantineTheme();

  const getTypeColor = (type: SearchResult['type']) => {
    const colors: Record<SearchResult['type'], string> = {
      order: '#4c6ef5',
      customer: '#f06595',
      product: '#15aabf',
    };
    return colors[type];
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    return type === 'order' ? 'Заказ' : type === 'customer' ? 'Клиент' : 'Товар';
  };

  // Special rendering for orders
  if (result.type === 'order' && result.status) {
    return (
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick();
          }
        }}
        style={{
          padding: '12px',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = theme.colors.gray[1];
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
        }}
      >
        <Group justify="space-between" align="flex-start" gap="sm" wrap="nowrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
            <Text size="lg">{result.icon}</Text>
            <Text size="sm" fw={500}>
              {result.title}
            </Text>
          </div>

          <Flex direction="column" align="flex-end" gap={4}>
            <Badge
              size="sm"
              color={statusColors[result.status] || 'gray'}
              variant="filled"
            >
              {result.status}
            </Badge>
          </Flex>
        </Group>

        <Flex gap="xs" wrap="wrap" style={{ marginTop: '6px', marginLeft: '26px' }}>
          {result.customer && (
            <Text size="xs" c="dimmed">
              👤 {result.customer}
            </Text>
          )}
          {result.notes && (
            <Text size="xs" c="dimmed" lineClamp={1}>
              📝 {result.notes.substring(0, 50)}
              {result.notes.length > 50 ? '...' : ''}
            </Text>
          )}
        </Flex>
      </div>
    );
  }

  // Default rendering for other types
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
      style={{
        padding: '10px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = theme.colors.gray[1];
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
    >
      <Group justify="space-between" align="flex-start" gap="xs">
        <div style={{ flex: 1, minWidth: 0 }}>
          <Group gap={6}>
            <Text size="lg">{result.icon}</Text>
            <div>
              <Text size="sm" fw={500} lineClamp={1}>
                {result.title}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={2}>
                {result.description}
              </Text>
            </div>
          </Group>
        </div>
        <Badge
          size="xs"
          color={getTypeColor(result.type)}
          style={{ whiteSpace: 'nowrap' }}
        >
          {getTypeLabel(result.type)}
        </Badge>
      </Group>
    </div>
  );
}
