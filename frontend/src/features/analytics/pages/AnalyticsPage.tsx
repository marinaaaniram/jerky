import React from 'react';
import { Container, Tabs, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

interface AnalyticsPageProps {
  activeTab?: string;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ activeTab = 'sales' }) => {
  const navigate = useNavigate();

  const handleTabChange = (tab: string | null) => {
    if (tab) {
      navigate(`/analytics/${tab}`);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Title mb="xl" order={1}>
        Аналитика и отчеты
      </Title>

      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tabs.List>
          <Tabs.Tab value="sales">
            Продажи
          </Tabs.Tab>
          <Tabs.Tab value="customers">
            Клиенты
          </Tabs.Tab>
          <Tabs.Tab value="products">
            Товары
          </Tabs.Tab>
          <Tabs.Tab value="stock">
            Склад
          </Tabs.Tab>
          <Tabs.Tab value="orders">
            Заказы
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </Container>
  );
};
