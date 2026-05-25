import { useQuery } from '@tanstack/react-query';

import { api } from '../lib/api';

interface Company {
  id: string;
  name: string;
  nit?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

interface Site {
  id: string;
  name: string;
  city?: string | null;
  address?: string | null;
}

interface Area {
  id: string;
  name: string;
  floor?: string | null;
  description?: string | null;
}

export function OrganizationPage() {
  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get<Company[]>('/companies');
      return response.data;
    },
  });

  const sitesQuery = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const response = await api.get<Site[]>('/sites');
      return response.data;
    },
  });

  const areasQuery = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await api.get<Area[]>('/areas');
      return response.data;
    },
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Organización</h1>
        <p className="mt-1 text-sm text-slate-400">
          Empresas, sedes y áreas disponibles para el inventario.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">Empresas</h2>
          <div className="mt-4 space-y-3">
            {(companiesQuery.data ?? []).map((company) => (
              <div key={company.id} className="rounded-2xl bg-slate-950 p-4">
                <p className="font-medium text-white">{company.name}</p>
                <p className="text-sm text-slate-400">{company.nit ?? 'Sin NIT'}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">Sedes</h2>
          <div className="mt-4 space-y-3">
            {(sitesQuery.data ?? []).map((site) => (
              <div key={site.id} className="rounded-2xl bg-slate-950 p-4">
                <p className="font-medium text-white">{site.name}</p>
                <p className="text-sm text-slate-400">{site.city ?? 'Sin ciudad'}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">Áreas</h2>
          <div className="mt-4 space-y-3">
            {(areasQuery.data ?? []).map((area) => (
              <div key={area.id} className="rounded-2xl bg-slate-950 p-4">
                <p className="font-medium text-white">{area.name}</p>
                <p className="text-sm text-slate-400">Piso {area.floor ?? '-'}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
