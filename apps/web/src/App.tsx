import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppLayout } from './layout/AppLayout';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { DashboardPage } from './pages/DashboardPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { EquipmentProfilePage } from './pages/EquipmentProfilePage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { MaintenanceOrderDetailPage } from './pages/MaintenanceOrderDetailPage';
import { MaintenanceOrdersPage } from './pages/MaintenanceOrdersPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';

const DemoGuidePage = lazy(() =>
  import('./pages/DemoGuidePage').then((module) => ({
    default: module.DemoGuidePage,
  })),
);

const FeedbackPage = lazy(() =>
  import('./pages/FeedbackPage').then((module) => ({
    default: module.FeedbackPage,
  })),
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/demo"
        element={
          <Suspense
            fallback={
              <main className="grid min-h-screen place-items-center bg-[#f7f8fa] text-sm font-semibold text-[#475467]">
                Cargando guía de demo...
              </main>
            }
          >
            <DemoGuidePage />
          </Suspense>
        }
      />
      <Route
        path="/feedback"
        element={
          <Suspense
            fallback={
              <main className="grid min-h-screen place-items-center bg-[#f7f8fa] text-sm font-semibold text-[#475467]">
                Cargando formulario de feedback...
              </main>
            }
          >
            <FeedbackPage />
          </Suspense>
        }
      />
      <Route
        path="/login"
        element={
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        }
      />

      <Route
        element={
          <AuthProvider>
            <ProtectedRoute />
          </AuthProvider>
        }
      >
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/equipment/:id" element={<EquipmentProfilePage />} />
          <Route path="/maintenance-orders" element={<MaintenanceOrdersPage />} />
          <Route
            path="/maintenance-orders/:id"
            element={<MaintenanceOrderDetailPage />}
          />
          <Route path="/organization" element={<OrganizationPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
