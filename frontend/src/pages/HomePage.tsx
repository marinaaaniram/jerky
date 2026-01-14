import { useAuthStore } from '../store/authStore';
import { DeliveryPanel } from '../components/delivery/DeliveryPanel';
import { DashboardPage } from './DashboardPage';

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const isCourier = user?.role.name === 'Курьер';

  if (isCourier) {
    return <DeliveryPanel />;
  }

  return <DashboardPage />;
}

