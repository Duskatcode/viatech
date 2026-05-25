import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Layers3, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';

import { AreaFormModal } from '../organization/AreaFormModal';
import { CompanyFormModal } from '../organization/CompanyFormModal';
import { SiteFormModal } from '../organization/SiteFormModal';
import { organizationService } from '../services/organization.service';
import type {
  Area,
  Company,
  CreateAreaPayload,
  CreateSitePayload,
  Site,
  UpdateAreaPayload,
  UpdateCompanyPayload,
  UpdateSitePayload,
} from '../types/domain';

export function OrganizationPage() {
  const queryClient = useQueryClient();

  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [siteForm, setSiteForm] = useState<Site | null | undefined>();
  const [areaForm, setAreaForm] = useState<Area | null | undefined>();

  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: organizationService.companies,
  });

  const sitesQuery = useQuery({
    queryKey: ['sites'],
    queryFn: organizationService.sites,
  });

  const areasQuery = useQuery({
    queryKey: ['areas'],
    queryFn: organizationService.areas,
  });

  const updateCompanyMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCompanyPayload;
    }) => organizationService.updateCompany(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['companies'] });
      setCompanyToEdit(null);
    },
  });

  const createSiteMutation = useMutation({
    mutationFn: (payload: CreateSitePayload) => organizationService.createSite(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sites'] });
      setSiteForm(undefined);
    },
  });

  const updateSiteMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSitePayload }) =>
      organizationService.updateSite(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sites'] });
      setSiteForm(undefined);
    },
  });

  const removeSiteMutation = useMutation({
    mutationFn: (id: string) => organizationService.removeSite(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sites'] });
      await queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
  });

  const createAreaMutation = useMutation({
    mutationFn: (payload: CreateAreaPayload) => organizationService.createArea(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['areas'] });
      setAreaForm(undefined);
    },
  });

  const updateAreaMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAreaPayload }) =>
      organizationService.updateArea(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['areas'] });
      setAreaForm(undefined);
    },
  });

  const removeAreaMutation = useMutation({
    mutationFn: (id: string) => organizationService.removeArea(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
  });

  const companies = companiesQuery.data ?? [];
  const sites = sitesQuery.data ?? [];
  const areas = areasQuery.data ?? [];

  const areasBySiteId = useMemo(() => {
    return areas.reduce<Record<string, Area[]>>((acc, area) => {
      if (!area.siteId) return acc;

      acc[area.siteId] = [...(acc[area.siteId] ?? []), area];
      return acc;
    }, {});
  }, [areas]);

  async function handleCompanySubmit(payload: UpdateCompanyPayload) {
    if (!companyToEdit) return;

    await updateCompanyMutation.mutateAsync({
      id: companyToEdit.id,
      payload,
    });
  }

  async function handleSiteSubmit(payload: CreateSitePayload | UpdateSitePayload) {
    if (siteForm?.id) {
      await updateSiteMutation.mutateAsync({
        id: siteForm.id,
        payload,
      });
      return;
    }

    await createSiteMutation.mutateAsync(payload as CreateSitePayload);
  }

  async function handleAreaSubmit(payload: CreateAreaPayload | UpdateAreaPayload) {
    if (areaForm?.id) {
      await updateAreaMutation.mutateAsync({
        id: areaForm.id,
        payload,
      });
      return;
    }

    await createAreaMutation.mutateAsync(payload as CreateAreaPayload);
  }

  async function handleRemoveSite(site: Site) {
    const confirmed = window.confirm(`¿Eliminar la sede "${site.name}"?`);

    if (!confirmed) return;

    await removeSiteMutation.mutateAsync(site.id);
  }

  async function handleRemoveArea(area: Area) {
    const confirmed = window.confirm(`¿Eliminar el área "${area.name}"?`);

    if (!confirmed) return;

    await removeAreaMutation.mutateAsync(area.id);
  }

  const isLoading =
    companiesQuery.isLoading || sitesQuery.isLoading || areasQuery.isLoading;

  if (isLoading) {
    return <p className="text-slate-400">Cargando organización...</p>;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-white">Organización</h1>
          <p className="mt-1 text-sm text-slate-400">
            Administra empresas, sedes y áreas para ubicar equipos biomédicos.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSiteForm(null)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <Plus size={18} />
            Nueva sede
          </button>

          <button
            type="button"
            onClick={() => setAreaForm(null)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Nueva área
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={Building2} label="Empresas" value={companies.length} />
        <Metric icon={MapPin} label="Sedes" value={sites.length} />
        <Metric icon={Layers3} label="Áreas" value={areas.length} />
      </div>

      <div className="space-y-5">
        {companies.map((company) => {
          const companySites = sites.filter((site) => site.companyId === company.id);

          return (
            <article
              key={company.id}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                    Empresa
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    {company.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {company.nit ?? 'Sin NIT'} · {company.email ?? 'Sin email'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCompanyToEdit(company)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                >
                  <Pencil size={16} />
                  Editar empresa
                </button>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {companySites.map((site) => (
                  <div
                    key={site.id}
                    className="rounded-3xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white">{site.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {site.city ?? 'Sin ciudad'} ·{' '}
                          {site.address ?? 'Sin dirección'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSiteForm(site)}
                          className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800"
                          title="Editar sede"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleRemoveSite(site)}
                          className="rounded-xl border border-red-500/30 p-2 text-red-300 transition hover:bg-red-500/10"
                          title="Eliminar sede"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {(areasBySiteId[site.id] ?? []).map((area) => (
                        <div
                          key={area.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3"
                        >
                          <div>
                            <p className="font-medium text-white">{area.name}</p>
                            <p className="text-xs text-slate-500">
                              Piso {area.floor ?? '-'}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setAreaForm(area)}
                              className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800"
                              title="Editar área"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleRemoveArea(area)}
                              className="rounded-xl border border-red-500/30 p-2 text-red-300 transition hover:bg-red-500/10"
                              title="Eliminar área"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {(areasBySiteId[site.id] ?? []).length === 0 ? (
                        <p className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-500">
                          Esta sede aún no tiene áreas.
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}

                {companySites.length === 0 ? (
                  <p className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-sm text-slate-500">
                    Esta empresa aún no tiene sedes activas.
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {companyToEdit ? (
        <CompanyFormModal
          company={companyToEdit}
          isSubmitting={updateCompanyMutation.isPending}
          onClose={() => setCompanyToEdit(null)}
          onSubmit={handleCompanySubmit}
        />
      ) : null}

      {siteForm !== undefined ? (
        <SiteFormModal
          site={siteForm}
          companies={companies}
          isSubmitting={createSiteMutation.isPending || updateSiteMutation.isPending}
          onClose={() => setSiteForm(undefined)}
          onSubmit={handleSiteSubmit}
        />
      ) : null}

      {areaForm !== undefined ? (
        <AreaFormModal
          area={areaForm}
          sites={sites}
          isSubmitting={createAreaMutation.isPending || updateAreaMutation.isPending}
          onClose={() => setAreaForm(undefined)}
          onSubmit={handleAreaSubmit}
        />
      ) : null}
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        </div>

        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
          <Icon size={24} />
        </div>
      </div>
    </article>
  );
}
