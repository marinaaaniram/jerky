import { useState, useCallback } from 'react';
import { TextInput, Paper, Group, Text, ActionIcon, Loader, Stack, Badge } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { searchAPI, type SearchResult } from '../api/search';
import styles from './GlobalSearch.module.css';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();

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
    <div className={styles.searchContainer}>
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
            className={styles.resultsDropdown}
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
                    />
                  ))}
                </>
              )}
            </Stack>
          </Paper>
        )}

        {opened && results.length === 0 && !loading && query.length >= 2 && (
          <Paper
            className={styles.resultsDropdown}
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
}

function SearchResultItem({ result, onClick }: SearchResultItemProps) {
  const getTypeColor = (type: SearchResult['type']) => {
    const colors: Record<SearchResult['type'], string> = {
      order: '#4c6ef5',
      customer: '#f06595',
      product: '#15aabf',
    };
    return colors[type];
  };

  return (
    <div
      className={styles.resultItem}
      onClick={onClick}
      style={{
        padding: '10px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5';
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
          {result.type === 'order' ? 'Заказ' : result.type === 'customer' ? 'Клиент' : 'Товар'}
        </Badge>
      </Group>
    </div>
  );
}
