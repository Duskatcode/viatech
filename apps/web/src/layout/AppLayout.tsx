import {
  Activity,
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MonitorCog,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';

const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Equipos',
    href: '/equipment',
    icon: MonitorCog,
  },
  {
    label: 'Mantenimientos',
    href: '/maintenance-orders',
    icon: ClipboardList,
  },
  {
    label: 'Organización',
    href: '/organization',
    icon: Building2,
  },
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-800 bg-slate-950/95 px-5 py-6 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
            <Activity size={24} />
          </div>

          <div>
            <p className="text-sm text-slate-400">Biomed</p>
            <h1 className="text-lg font-semibold text-white">Maintenance</h1>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white',
                  ].join(' ')
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm font-semibold text-white">{user?.name}</p>
          <p className="mt-1 truncate text-xs text-slate-400">{user?.email}</p>
          <p className="mt-2 inline-flex rounded-full bg-slate-800 px-2 py-1 text-xs text-cyan-300">
            {user?.role}
          </p>

          <button
            type="button"
            onClick={() => void logout()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Plataforma biomédica
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Gestión de mantenimiento
              </h2>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
