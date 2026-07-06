import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  CircleQuestionMark,
  LifeBuoy,
  Keyboard,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { alertsService } from '../services/alerts.service';
import { equipmentService } from '../services/equipment.service';
import { maintenanceOrdersService } from '../services/maintenance-orders.service';
import { organizationService } from '../services/organization.service';
import { UserRole } from '../types/auth';

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Panel de control',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Equipos',
    href: '/equipment',
    icon: Stethoscope,
  },
  {
    label: 'Órdenes de trabajo',
    href: '/maintenance-orders',
    icon: ClipboardList,
  },
  {
    label: 'Organización',
    href: '/organization',
    icon: Building2,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    label: 'Usuarios',
    href: '/users',
    icon: UsersRound,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    label: 'Reportes',
    href: '/reports',
    icon: BarChart3,
  },
  {
    label: 'Auditoría',
    href: '/audit-logs',
    icon: ShieldCheck,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VIEWER],
  },
];

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || 'Usuario';
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const companyQuery = useQuery({
    queryKey: ['layout-company', user?.companyId],
    queryFn: organizationService.companies,
    enabled: user?.role === 'ADMIN' && Boolean(user.companyId),
  });
  const headerTitle =
    user?.role === 'SUPER_ADMIN'
      ? 'Panel global'
      : (companyQuery.data?.[0]?.name ?? 'Panel de empresa');
  const headerSubtitle =
    user?.role === 'SUPER_ADMIN'
      ? 'Resumen general de todas las empresas'
      : 'Plataforma de mantenimiento biomédico';

  const alertsQuery = useQuery({
    queryKey: ['header-alerts-summary'],
    queryFn: () => alertsService.summary(30),
    staleTime: 60_000,
  });

  const unreadCount = alertsQuery.data?.counts.total ?? 0;

  const recentNotifications = useMemo(() => {
    const summary = alertsQuery.data;
    if (!summary) return [];

    const items: { id: string; title: string; description: string; path: string }[] = [];

    summary.overdueOrders.slice(0, 3).forEach((order) => {
      items.push({
        id: `overdue-${order.id}`,
        title: `Orden vencida: ${order.code}`,
        description: order.equipment?.name ?? 'Equipo sin asignar',
        path: `/maintenance-orders/${order.id}`,
      });
    });

    summary.upcomingOrders.slice(0, 2).forEach((order) => {
      items.push({
        id: `upcoming-${order.id}`,
        title: `Orden próxima a vencer: ${order.code}`,
        description: order.scheduledDate
          ? new Date(order.scheduledDate).toLocaleDateString()
          : 'Sin fecha programada',
        path: `/maintenance-orders/${order.id}`,
      });
    });

    summary.warrantyExpiringEquipment.slice(0, 2).forEach((eq) => {
      items.push({
        id: `warranty-${eq.id}`,
        title: `Garantía por vencer: ${eq.name}`,
        description: eq.internalCode,
        path: `/equipment/${eq.id}`,
      });
    });

    return items;
  }, [alertsQuery.data]);

  const helpItems: {
    label: string;
    icon: LucideIcon;
    description: string;
    path?: string;
  }[] = [
    { label: 'Manual', icon: BookOpen, description: 'Guía operativa de uso', path: '/demo' },
    {
      label: 'Documentación',
      icon: FileText,
      description: 'Procedimientos institucionales',
      path: '/demo',
    },
    {
      label: 'Soporte',
      icon: LifeBuoy,
      description: 'Contacto con el equipo de soporte',
      path: '/feedback',
    },
    {
      label: 'Atajos',
      icon: Keyboard,
      description: 'Próximamente',
    },
  ];

  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);

    return () => clearTimeout(handle);
  }, [searchQuery]);

  const canSearch = debouncedSearch.length >= 2;

  const equipmentSearchQuery = useQuery({
    queryKey: ['header-search-equipment', debouncedSearch],
    queryFn: () => equipmentService.findAll({ search: debouncedSearch }),
    enabled: canSearch,
  });

  const ordersSearchQuery = useQuery({
    queryKey: ['header-search-orders', debouncedSearch],
    queryFn: () => maintenanceOrdersService.findAll({ search: debouncedSearch }),
    enabled: canSearch,
  });

  const isSearching =
    canSearch && (equipmentSearchQuery.isFetching || ordersSearchQuery.isFetching);

  const filteredResults = useMemo(() => {
    if (!canSearch) return [];

    const equipmentResults = (equipmentSearchQuery.data ?? []).slice(0, 5).map((eq) => ({
      id: `equipment-${eq.id}`,
      label: 'Equipos',
      title: eq.name,
      description: `${eq.internalCode} · ${eq.site?.name ?? 'Sin sede'}`,
      path: `/equipment/${eq.id}`,
    }));

    const orderResults = (ordersSearchQuery.data ?? []).slice(0, 5).map((order) => ({
      id: `order-${order.id}`,
      label: 'Órdenes',
      title: order.code,
      description: `${order.type} · ${order.status}`,
      path: `/maintenance-orders/${order.id}`,
    }));

    return [...equipmentResults, ...orderResults];
  }, [canSearch, equipmentSearchQuery.data, ordersSearchQuery.data]);

  function handleSelectSearch(path: string) {
    setSearchQuery('');
    navigate(path);
  }

  return (
    <div className="stitch-app-shell">
      <aside className="stitch-sidebar">
        <div className="flex items-center gap-3 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--stitch-primary)] text-white">
            <Activity size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-xl font-bold leading-none text-white">
              Vitatech
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
              Institutional Precision
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-3">
          {navigationItems
            .filter(
              (item) =>
                !item.roles || (user ? item.roles.includes(user.role) : false),
            )
            .map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/dashboard'}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors',
                      isActive
                        ? 'border-l-4 border-[var(--stitch-primary)] bg-[rgb(0_86_179_/_0.16)] text-white'
                        : 'text-white/55 hover:bg-white/10 hover:text-white',
                    ].join(' ')
                  }
                >
                  <Icon size={19} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--stitch-primary-container)] text-sm font-bold text-white">
              {getInitials(user?.name, user?.email)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {user?.name ?? 'Usuario'}
              </p>
              <p className="truncate text-[11px] text-white/45">
                {user?.role ?? user?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg p-2 text-white/45 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="stitch-main">
        <header className="stitch-topbar">
          <div className="flex min-w-0 items-center gap-4">
            <div className="min-w-0">
              <p className="truncate text-xl font-bold text-[var(--stitch-on-surface)]">
                {headerTitle}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--stitch-on-surface-variant)]">
                {headerSubtitle}
              </p>
            </div>

            <div className="hidden h-8 w-px bg-[var(--stitch-outline-variant)] lg:block" />

            <div className="relative hidden lg:block">
              <label className="flex items-center gap-2 rounded-lg border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] px-3 py-2">
                <Search size={17} className="text-[var(--stitch-outline)]" />
                <input
                  className="w-72 border-0 bg-transparent p-0 text-sm text-[var(--stitch-on-surface)] placeholder:text-[var(--stitch-outline)] focus:outline-none focus:ring-0"
                  placeholder="Buscar equipos, órdenes o reportes..."
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  aria-label="Buscar equipos, órdenes o reportes"
                />
              </label>

              {searchQuery.trim() ? (
                <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-2xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-lowest)] p-2 shadow-xl">
                  {isSearching ? (
                    <div className="rounded-xl bg-[var(--stitch-surface-low)] px-3 py-4 text-sm text-[var(--stitch-on-surface-variant)]">
                      Buscando...
                    </div>
                  ) : filteredResults.length > 0 ? (
                    filteredResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSearch(item.path)}
                        className="flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[var(--stitch-surface-low)]"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[var(--stitch-on-surface)]">{item.title}</p>
                          <p className="mt-1 text-xs text-[var(--stitch-on-surface-variant)]">{item.description}</p>
                        </div>
                        <span className="rounded-full bg-[rgb(0_63_135_/_0.08)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--stitch-primary)]">
                          {item.label}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-xl bg-[var(--stitch-surface-low)] px-3 py-4 text-sm text-[var(--stitch-on-surface-variant)]">
                      No hay coincidencias para esta búsqueda.
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--stitch-on-surface-variant)] transition-colors hover:bg-[var(--stitch-surface-container)] hover:text-[var(--stitch-primary)]"
                aria-label="Notificaciones"
                aria-expanded={showNotifications}
                onClick={() => setShowNotifications((current) => !current)}
              >
                <Bell size={19} />
                <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--stitch-error)] text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              </button>

              {showNotifications ? (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[320px] rounded-2xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-lowest)] p-3 shadow-xl">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[var(--stitch-on-surface)]">Notificaciones recientes</p>
                    <span className="text-xs text-[var(--stitch-outline)]">{unreadCount} activas</span>
                  </div>

                  <div className="space-y-2">
                    {recentNotifications.length > 0 ? (
                      recentNotifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => {
                            setShowNotifications(false);
                            navigate(notification.path);
                          }}
                          className="flex w-full items-start gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition hover:border-[var(--stitch-outline-variant)] hover:bg-[var(--stitch-surface-low)]"
                        >
                          <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-[var(--stitch-primary)]" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[var(--stitch-on-surface)]">{notification.title}</p>
                            <p className="mt-1 text-xs text-[var(--stitch-on-surface-variant)]">{notification.description}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-xl bg-[var(--stitch-surface-low)] px-3 py-4 text-sm text-[var(--stitch-on-surface-variant)]">
                        Sin novedades por ahora.
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--stitch-on-surface-variant)] transition-colors hover:bg-[var(--stitch-surface-container)] hover:text-[var(--stitch-primary)]"
                aria-label="Ayuda"
                aria-expanded={showHelp}
                onClick={() => setShowHelp((current) => !current)}
              >
                <HelpCircle size={19} />
              </button>

              {showHelp ? (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[260px] rounded-2xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-lowest)] p-3 shadow-xl">
                  <div className="mb-2 flex items-center gap-2">
                    <CircleQuestionMark size={16} className="text-[var(--stitch-primary)]" />
                    <p className="text-sm font-semibold text-[var(--stitch-on-surface)]">Ayuda institucional</p>
                  </div>

                  <div className="space-y-1">
                    {helpItems.map((item) => {
                      const Icon = item.icon;
                      const disabled = !item.path;

                      return (
                        <button
                          key={item.label}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            if (!item.path) return;
                            setShowHelp(false);
                            navigate(item.path);
                          }}
                          className={[
                            'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition',
                            disabled
                              ? 'cursor-not-allowed opacity-50'
                              : 'hover:bg-[var(--stitch-surface-low)]',
                          ].join(' ')}
                        >
                          <span className="flex items-center gap-2">
                            <Icon size={16} className="text-[var(--stitch-primary)]" />
                            <span className="text-sm text-[var(--stitch-on-surface)]">{item.label}</span>
                          </span>
                          {disabled ? (
                            <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--stitch-outline)]">
                              {item.description}
                            </span>
                          ) : (
                            <ChevronRight size={16} className="text-[var(--stitch-outline)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] px-3 py-2 text-xs text-[var(--stitch-on-surface-variant)]">
                    <p className="font-semibold text-[var(--stitch-on-surface)]">Versión del sistema</p>
                    <p className="mt-1">Vitatech v0.2.0 · Modo institucional</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mx-2 hidden h-8 w-px bg-[var(--stitch-outline-variant)] sm:block" />

            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-bold leading-none text-[var(--stitch-on-surface)]">
                  {user?.name ?? 'Usuario'}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[var(--stitch-on-surface-variant)]">
                  {user?.role ?? 'Sesión activa'}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-lowest)] text-sm font-bold text-[var(--stitch-primary)]">
                {getInitials(user?.name, user?.email)}
              </div>
            </div>
          </div>
        </header>

        <div className="stitch-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
