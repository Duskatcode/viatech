import { Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppLayout } from './layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { LoginPage } from './pages/LoginPage';
import { MaintenanceOrdersPage } from './pages/MaintenanceOrdersPage';
import { OrganizationPage } from './pages/OrganizationPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/maintenance-orders" element={<MaintenanceOrdersPage />} />
          <Route path="/organization" element={<OrganizationPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
