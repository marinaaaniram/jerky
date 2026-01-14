import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './features/auth/LoginPage';
import { HomePage } from './pages/HomePage';
import { OrdersPage } from './features/orders/pages/OrdersPage';
import { OrderDetailsPage } from './features/orders/pages/OrderDetailsPage';
import { CreateOrderPage } from './features/orders/pages/CreateOrderPage';
import { OrderDocumentsPage } from './features/documents/pages/OrderDocumentsPage';
import { ProductsPage } from './features/products/pages/ProductsPage';
import { CreateProductPage } from './features/products/pages/CreateProductPage';
import { ProductDetailsPage } from './features/products/pages/ProductDetailsPage';
import { CustomersPage } from './features/customers/pages/CustomersPage';
import { CreateCustomerPage } from './features/customers/pages/CreateCustomerPage';
import { CustomerDetailsPage } from './features/customers/pages/CustomerDetailsPage';
import { InventoryPage } from './features/inventory/pages/InventoryPage';
import { SalesReportPage } from './features/analytics/pages/SalesReportPage';
import { CustomerReportPage } from './features/analytics/pages/CustomerReportPage';
import { ProductReportPage } from './features/analytics/pages/ProductReportPage';
import { StockReportPage } from './features/analytics/pages/StockReportPage';
import { OrderStatusReportPage } from './features/analytics/pages/OrderStatusReportPage';
import { UsersPage } from './features/users/pages/UsersPage';
import { CreateUserPage } from './features/users/pages/CreateUserPage';
import { UserDetailsPage } from './features/users/pages/UserDetailsPage';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { theme } from './theme/theme';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Initialize auth state from localStorage on app load
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        useAuthStore.setState({
          user,
          token,
          isAuthenticated: true,
        });
      } catch {
        // If parsing fails, clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="light"
    >
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
            />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<HomePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/new" element={<CreateOrderPage />} />
              <Route path="/orders/:id" element={<OrderDetailsPage />} />
              <Route path="/orders/:id/documents" element={<OrderDocumentsPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/new" element={<CreateProductPage />} />
              <Route path="/products/:id" element={<ProductDetailsPage />} />
              <Route path="/inventory-check" element={<InventoryPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/new" element={<CreateCustomerPage />} />
              <Route path="/customers/:id" element={<CustomerDetailsPage />} />
              <Route path="/analytics/sales" element={<SalesReportPage />} />
              <Route path="/analytics/customers" element={<CustomerReportPage />} />
              <Route path="/analytics/products" element={<ProductReportPage />} />
              <Route path="/analytics/stock" element={<StockReportPage />} />
              <Route path="/analytics/orders" element={<OrderStatusReportPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/new" element={<CreateUserPage />} />
              <Route path="/users/:id" element={<UserDetailsPage />} />
            </Route>

            <Route 
              path="*" 
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
              } 
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
