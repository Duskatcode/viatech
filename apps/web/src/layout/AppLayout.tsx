import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import type { UserRole } from '../types/auth';

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Panel de control',
    href: '/',
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
  },
  {
    label: 'Usuarios',
    href: '/users',
    icon: UsersRound,
    roles: ['SUPER_ADMIN', 'ADMIN'],
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

  return (
    <div className="stitch-app-shell">
      <aside className="stitch-sidebar">
        <div className="flex items-center gap-3 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--stitch-primary)] text-white">
            <Activity size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-xl font-bold leading-none text-white">BioMed Control</p>
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
                  end={item.href === '/'}
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
              <p className="truncate text-sm font-bold text-white">{user?.name ?? 'Usuario'}</p>
              <p className="truncate text-[11px] text-white/45">{user?.role ?? user?.email}</p>
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
                Clínica Metropolitana
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--stitch-on-surface-variant)]">
                Plataforma de mantenimiento biomédico
              </p>
            </div>

            <div className="hidden h-8 w-px bg-[var(--stitch-outline-variant)] lg:block" />

            <label className="hidden items-center gap-2 rounded-lg border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] px-3 py-2 lg:flex">
              <Search size={17} className="text-[var(--stitch-outline)]" />
              <input
                className="w-72 border-0 bg-transparent p-0 text-sm text-[var(--stitch-on-surface)] placeholder:text-[var(--stitch-outline)] focus:ring-0"
                placeholder="Buscar equipos, órdenes o reportes..."
                type="search"
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--stitch-on-surface-variant)] transition-colors hover:bg-[var(--stitch-surface-container)] hover:text-[var(--stitch-primary)]"
              aria-label="Notificaciones"
            >
              <Bell size={19} />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[var(--stitch-error)]" />
            </button>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--stitch-on-surface-variant)] transition-colors hover:bg-[var(--stitch-surface-container)] hover:text-[var(--stitch-primary)]"
              aria-label="Ayuda"
            >
              <HelpCircle size={19} />
            </button>

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

      <button
        type="button"
        className="fixed bottom-8 right-8 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-[var(--stitch-primary)] text-white shadow-2xl transition-transform hover:scale-105 active:scale-95 lg:flex"
        aria-label="Acción rápida"
        title="Acción rápida"
      >
        <Wrench size={23} />
      </button>
    </div>
  );
}
