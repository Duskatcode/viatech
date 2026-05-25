import { Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppLayout } from './layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { EquipmentProfilePage } from './pages/EquipmentProfilePage';
import { LoginPage } from './pages/LoginPage';
import { MaintenanceOrderDetailPage } from './pages/MaintenanceOrderDetailPage';
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
          <Route path="/equipment/:id" element={<EquipmentProfilePage />} />
          <Route path="/maintenance-orders" element={<MaintenanceOrdersPage />} />
          <Route
            path="/maintenance-orders/:id"
            element={<MaintenanceOrderDetailPage />}
          />
          <Route path="/organization" element={<OrganizationPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
