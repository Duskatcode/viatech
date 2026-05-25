import { useState } from 'react';
import type { FormEvent } from 'react';
import { Download, FileText, Paperclip, Trash2, Upload } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '../lib/error-message';
import { validateFileSize } from '../lib/form-validation';
import { attachmentsService } from '../services/attachments.service';
import type { Attachment } from '../types/domain';
import { ConfirmModal } from '../ui/ConfirmModal';
import { FieldError, FieldHint } from '../ui/FieldFeedback';
import { ResponsiveTable } from '../ui/ResponsiveTable';
import { SubmitButton } from '../ui/SubmitButton';
import { EmptyState, ErrorState, LoadingState } from '../ui/StateMessage';
import { StatusPill } from '../ui/StatusPill';
import { useToast } from '../ui/ToastProvider';

type AttachmentOwnerType = 'equipment' | 'maintenance-order';

interface AttachmentsPanelProps {
  ownerType: AttachmentOwnerType;
  ownerId: string;
  title: string;
  description?: string;
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function AttachmentsPanel({
  ownerType,
  ownerId,
  title,
  description,
}: AttachmentsPanelProps) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [type, setType] = useState('OTHER');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(
    null,
  );

  const queryKey = ['attachments', ownerType, ownerId];

  const attachmentsQuery = useQuery({
    queryKey,
    queryFn: () => {
      if (ownerType === 'equipment') {
        return attachmentsService.listEquipmentAttachments(ownerId);
      }

      return attachmentsService.listMaintenanceOrderAttachments(ownerId);
    },
    enabled: Boolean(ownerId),
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) {
        throw new Error('Selecciona un archivo antes de subirlo.');
      }

      if (!validateFileSize(file, 10)) {
        throw new Error('El archivo no puede superar 10 MB.');
      }

      if (ownerType === 'equipment') {
        return attachmentsService.uploadEquipmentAttachment(ownerId, {
          file,
          type,
        });
      }

      return attachmentsService.uploadMaintenanceOrderAttachment(ownerId, {
        file,
        type,
      });
    },
    onSuccess: async () => {
      setFile(null);
      setFileError('');
      setType('OTHER');

      await queryClient.invalidateQueries({ queryKey });

      addToast({
        type: 'success',
        title: 'Adjunto subido',
        description: 'El archivo fue guardado correctamente.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo subir el adjunto',
        description: getErrorMessage(error),
      });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (attachment: Attachment) =>
      attachmentsService.downloadAttachment(attachment),
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Descarga iniciada',
        description: 'El archivo se está descargando.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo descargar el adjunto',
        description: getErrorMessage(error),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (attachment: Attachment) =>
      attachmentsService.removeAttachment(attachment.id),
    onSuccess: async () => {
      setAttachmentToDelete(null);

      await queryClient.invalidateQueries({ queryKey });

      addToast({
        type: 'success',
        title: 'Adjunto eliminado',
        description: 'El archivo fue eliminado correctamente.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo eliminar el adjunto',
        description: getErrorMessage(error),
      });
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setFileError('Selecciona un archivo antes de subirlo.');
      return;
    }

    if (!validateFileSize(file, 10)) {
      setFileError('El archivo no puede superar 10 MB.');
      return;
    }

    setFileError('');
    await uploadMutation.mutateAsync();
  }

  const attachments = attachmentsQuery.data ?? [];

  return (
    <article className="stitch-card overflow-hidden">
      <div className="stitch-card-header flex flex-col justify-between gap-4 px-5 py-4 xl:flex-row xl:items-start">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-lg bg-[rgb(0_63_135_/_0.08)] p-3 text-[var(--stitch-primary)]">
            <Paperclip size={22} />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--stitch-on-surface)]">
              {title}
            </h2>

            {description ? (
              <p className="mt-1 text-sm text-[var(--stitch-on-surface-variant)]">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <form
          className="grid gap-3 rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-lowest)] p-4 md:min-w-[460px]"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-3 md:grid-cols-[0.8fr_1.4fr]">
            <label className="block">
              <span className="stitch-label">Tipo</span>
              <input
                className="stitch-input mt-2 px-4 py-3"
                placeholder="OTHER, MANUAL, EVIDENCE..."
                value={type}
                onChange={(event) => setType(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="stitch-label">Archivo</span>
              <input
                className="stitch-input mt-2 px-4 py-2.5 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--stitch-primary)] file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
                type="file"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setFileError('');
                }}
              />
            </label>
          </div>

          <div>
            <FieldHint message="Formatos permitidos según backend. Tamaño recomendado: máximo 10 MB." />
            <FieldError message={fileError} />
          </div>

          <SubmitButton
            isLoading={uploadMutation.isPending}
            loadingLabel="Subiendo..."
            disabled={!file}
            className="px-4"
          >
            <Upload size={18} />
            Subir adjunto
          </SubmitButton>
        </form>
      </div>

      <div className="p-5">
        {attachmentsQuery.isLoading ? (
          <LoadingState
            title="Cargando adjuntos..."
            description="Consultando archivos asociados."
          />
        ) : null}

        {attachmentsQuery.isError ? (
          <ErrorState
            title="No se pudieron cargar los adjuntos"
            description="Verifica tu sesión y el estado de la API."
          />
        ) : null}

        {!attachmentsQuery.isLoading &&
        !attachmentsQuery.isError &&
        attachments.length === 0 ? (
          <EmptyState
            title="Sin adjuntos"
            description="Todavía no hay archivos asociados a este registro."
          />
        ) : null}

        {attachments.length > 0 ? (
          <div className="grid gap-3 lg:hidden">
            <p className="sr-only">Vista móvil de adjuntos</p>

            {attachments.map((attachment) => (
              <article
                key={attachment.id}
                className="rounded-xl border border-[var(--stitch-outline-variant)] bg-[var(--stitch-surface-low)] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-[rgb(0_63_135_/_0.08)] p-2 text-[var(--stitch-primary)]">
                    <FileText size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-[var(--stitch-on-surface)]">
                      {attachment.originalName}
                    </p>

                    <p className="stitch-code mt-1 break-all text-xs text-[var(--stitch-outline)]">
                      {attachment.filename}
                    </p>

                    <div className="mt-3 grid gap-1 text-xs text-[var(--stitch-on-surface-variant)]">
                      <p>Tipo: {attachment.type}</p>
                      <p>MIME: {attachment.mimeType}</p>
                      <p>Tamaño: {formatFileSize(attachment.size)}</p>
                      <p>Fecha: {formatDate(attachment.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => void downloadMutation.mutateAsync(attachment)}
                    disabled={downloadMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--stitch-outline-variant)] px-3 py-2 text-xs font-bold text-[var(--stitch-primary)] transition hover:bg-[rgb(0_63_135_/_0.06)] disabled:opacity-60"
                  >
                    <Download size={15} />
                    Descargar
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttachmentToDelete(attachment)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--stitch-danger-border)] px-3 py-2 text-xs font-bold text-[var(--stitch-danger-text)] transition hover:bg-[var(--stitch-danger-bg)] disabled:opacity-60"
                  >
                    <Trash2 size={15} />
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {attachments.length > 0 ? (
          <div className="hidden lg:block">
            <ResponsiveTable wrapperClassName="rounded-lg">
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th>Tipo</th>
                  <th>MIME</th>
                  <th>Tamaño</th>
                  <th>Fecha</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {attachments.map((attachment) => (
                  <tr key={attachment.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-[rgb(0_63_135_/_0.08)] p-2 text-[var(--stitch-primary)]">
                          <FileText size={16} />
                        </div>

                        <div>
                          <p className="font-semibold text-[var(--stitch-on-surface)]">
                            {attachment.originalName}
                          </p>
                          <p className="stitch-code text-xs text-[var(--stitch-outline)]">
                            {attachment.filename}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <StatusPill tone="info">{attachment.type}</StatusPill>
                    </td>

                    <td className="text-[var(--stitch-on-surface-variant)]">
                      {attachment.mimeType}
                    </td>

                    <td className="text-[var(--stitch-on-surface-variant)]">
                      {formatFileSize(attachment.size)}
                    </td>

                    <td className="text-[var(--stitch-on-surface-variant)]">
                      {formatDate(attachment.createdAt)}
                    </td>

                    <td>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void downloadMutation.mutateAsync(attachment)
                          }
                          disabled={downloadMutation.isPending}
                          className="rounded-lg border border-[var(--stitch-outline-variant)] p-2 text-[var(--stitch-primary)] transition hover:bg-[rgb(0_63_135_/_0.06)] disabled:opacity-60"
                          title="Descargar"
                        >
                          <Download size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setAttachmentToDelete(attachment)}
                          disabled={deleteMutation.isPending}
                          className="rounded-lg border border-[var(--stitch-danger-border)] p-2 text-[var(--stitch-danger-text)] transition hover:bg-[var(--stitch-danger-bg)] disabled:opacity-60"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </ResponsiveTable>
          </div>
        ) : null}
      </div>

      {attachmentToDelete ? (
        <ConfirmModal
          title="Eliminar adjunto"
          description={`Se eliminará el archivo "${attachmentToDelete.originalName}". Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          variant="danger"
          isSubmitting={deleteMutation.isPending}
          onCancel={() => setAttachmentToDelete(null)}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(attachmentToDelete);
          }}
        />
      ) : null}
    </article>
  );
}
