import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from './useAuth';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  allowedRoles, 
  redirectTo = '/dashboard' 
}: ProtectedRouteProps = {}) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-5 shadow-xl">
          Cargando sesión...
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles, verificar que el usuario los tenga
  if (allowedRoles) {
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <Outlet />;
}
