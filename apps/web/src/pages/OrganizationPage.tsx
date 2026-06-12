import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import { Building2, Layers3, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';

import { useAuth } from '../auth/useAuth';
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
import { ActionButton } from '../ui/ActionButton';
import { PageHeader } from '../ui/PageHeader';
import { SectionCard } from '../ui/SectionCard';
import { ErrorState } from '../ui/StateMessage';

export function OrganizationPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canManageOrganization =
    user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const canEditCompany = user?.role === 'SUPER_ADMIN';

  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [siteForm, setSiteForm] = useState<Site | null | undefined>();
  const [areaForm, setAreaForm] = useState<Area | null | undefined>();

  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: organizationService.companies,
    enabled: canManageOrganization,
  });

  const sitesQuery = useQuery({
    queryKey: ['sites'],
    queryFn: organizationService.sites,
    enabled: canManageOrganization,
  });

  const areasQuery = useQuery({
    queryKey: ['areas'],
    queryFn: organizationService.areas,
    enabled: canManageOrganization,
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
    mutationFn: (payload: CreateSitePayload) =>
      organizationService.createSite(payload),
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
    mutationFn: (payload: CreateAreaPayload) =>
      organizationService.createArea(payload),
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
  const areas = useMemo(() => areasQuery.data ?? [], [areasQuery.data]);

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

  async function handleSiteSubmit(
    payload: CreateSitePayload | UpdateSitePayload,
  ) {
    if (siteForm?.id) {
      await updateSiteMutation.mutateAsync({
        id: siteForm.id,
        payload,
      });
      return;
    }

    await createSiteMutation.mutateAsync(payload as CreateSitePayload);
  }

  async function handleAreaSubmit(
    payload: CreateAreaPayload | UpdateAreaPayload,
  ) {
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

  if (!canManageOrganization) {
    return (
      <ErrorState
        title="No tienes permisos para ver esta sección."
        description="La administración de la organización está disponible para ADMIN y SUPER_ADMIN."
      />
    );
  }

  if (isLoading) {
    return (
      <p className="text-sm text-[var(--stitch-on-surface-variant)]">
        Cargando organización...
      </p>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Estructura institucional"
        title="Organización"
        description="Administra empresas, sedes y áreas para ubicar equipos biomédicos y segmentar operaciones."
        actions={
          <>
            <ActionButton
              type="button"
              icon={<Plus size={18} />}
              onClick={() => setSiteForm(null)}
            >
              Nueva sede
            </ActionButton>

            <ActionButton
              type="button"
              variant="secondary"
              icon={<Plus size={18} />}
              onClick={() => setAreaForm(null)}
            >
              Nueva área
            </ActionButton>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={Building2} label="Empresas" value={companies.length} />
        <Metric icon={MapPin} label="Sedes" value={sites.length} />
        <Metric icon={Layers3} label="Áreas" value={areas.length} />
      </div>

      <div className="space-y-5">
        {companies.map((company) => {
          const companySites = sites.filter(
            (site) => site.companyId === company.id,
          );

          return (
            <SectionCard
              key={company.id}
              title={company.name}
              description={`${company.nit ?? 'Sin NIT'} · ${company.email ?? 'Sin email'}`}
              icon={<Building2 size={22} />}
              actions={
                canEditCompany ? (
                  <ActionButton
                    type="button"
                    variant="secondary"
                    icon={<Pencil size={16} />}
                    onClick={() => setCompanyToEdit(company)}
                  >
                    Editar empresa
                  </ActionButton>
                ) : undefined
              }
            >
              <div className="grid gap-4 lg:grid-cols-2">
                {companySites.map((site) => (
                  <article
                    key={site.id}
                    className="rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="stitch-label">Sede</p>
                        <h3 className="mt-1 font-semibold text-[var(--stitch-on-surface)]">
                          {site.name}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--stitch-on-surface-variant)]">
                          {site.city ?? 'Sin ciudad'} ·{' '}
                          {site.address ?? 'Sin dirección'}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => setSiteForm(site)}
                          className="rounded-lg border border-[var(--stitch-outline-variant)] p-2 text-[var(--stitch-on-surface-variant)] transition hover:border-[var(--stitch-primary)] hover:bg-[rgb(0_63_135_/_0.06)] hover:text-[var(--stitch-primary)]"
                          title="Editar sede"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleRemoveSite(site)}
                          className="rounded-lg border border-[var(--stitch-danger-border)] p-2 text-[var(--stitch-danger-text)] transition hover:bg-[var(--stitch-danger-bg)]"
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
                          className="flex items-center justify-between gap-3 rounded-lg border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-lowest)] px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--stitch-on-surface)]">
                              {area.name}
                            </p>
                            <p className="text-xs text-[var(--stitch-on-surface-variant)]">
                              Piso {area.floor ?? '-'}
                            </p>
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() => setAreaForm(area)}
                              className="rounded-lg border border-[var(--stitch-outline-variant)] p-2 text-[var(--stitch-on-surface-variant)] transition hover:border-[var(--stitch-primary)] hover:bg-[rgb(0_63_135_/_0.06)] hover:text-[var(--stitch-primary)]"
                              title="Editar área"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleRemoveArea(area)}
                              className="rounded-lg border border-[var(--stitch-danger-border)] p-2 text-[var(--stitch-danger-text)] transition hover:bg-[var(--stitch-danger-bg)]"
                              title="Eliminar área"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {(areasBySiteId[site.id] ?? []).length === 0 ? (
                        <p className="rounded-lg border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-lowest)] p-4 text-sm text-[var(--stitch-on-surface-variant)]">
                          Esta sede aún no tiene áreas.
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}

                {companySites.length === 0 ? (
                  <p className="rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] p-5 text-sm text-[var(--stitch-on-surface-variant)]">
                    Esta empresa aún no tiene sedes activas.
                  </p>
                ) : null}
              </div>
            </SectionCard>
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
          isSubmitting={
            createSiteMutation.isPending || updateSiteMutation.isPending
          }
          onClose={() => setSiteForm(undefined)}
          onSubmit={handleSiteSubmit}
        />
      ) : null}

      {areaForm !== undefined ? (
        <AreaFormModal
          area={areaForm}
          sites={sites}
          isSubmitting={
            createAreaMutation.isPending || updateAreaMutation.isPending
          }
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
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <article className="stitch-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="stitch-label">{label}</p>
          <p className="mt-2 text-3xl font-bold text-[var(--stitch-on-surface)]">
            {value}
          </p>
        </div>

        <div className="rounded-lg bg-[rgb(0_63_135_/_0.08)] p-3 text-[var(--stitch-primary)]">
          <Icon size={24} />
        </div>
      </div>
    </article>
  );
}
