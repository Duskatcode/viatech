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
import { SubmitButton } from '../ui/SubmitButton';
import { EmptyState, ErrorState, LoadingState } from '../ui/StateMessage';
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
    <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div>
          <div className="mb-3 inline-flex rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
            <Paperclip size={22} />
          </div>

          <h2 className="text-lg font-semibold text-white">{title}</h2>

          {description ? (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          ) : null}
        </div>

        <form
          className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 md:min-w-[420px]"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-3 md:grid-cols-[1fr_1.4fr]">
            <input
              className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              placeholder="Tipo: OTHER, MANUAL, EVIDENCE..."
              value={type}
              onChange={(event) => setType(event.target.value)}
            />

            <input
              className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white file:mr-3 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
              type="file"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setFileError('');
              }}
            />
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

      <div className="mt-5">
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
                className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300">
                    <FileText size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-white">
                      {attachment.originalName}
                    </p>

                    <p className="mt-1 break-all text-xs text-slate-500">
                      {attachment.filename}
                    </p>

                    <div className="mt-3 grid gap-1 text-xs text-slate-400">
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
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    <Download size={15} />
                    Descargar
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttachmentToDelete(attachment)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
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
          <div className="hidden overflow-hidden rounded-2xl border border-slate-800 lg:block">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Archivo</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">MIME</th>
                  <th className="px-4 py-3">Tamaño</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {attachments.map((attachment) => (
                  <tr key={attachment.id} className="text-slate-300">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300">
                          <FileText size={16} />
                        </div>

                        <div>
                          <p className="font-medium text-white">
                            {attachment.originalName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {attachment.filename}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">{attachment.type}</td>
                    <td className="px-4 py-3">{attachment.mimeType}</td>
                    <td className="px-4 py-3">
                      {formatFileSize(attachment.size)}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(attachment.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void downloadMutation.mutateAsync(attachment)
                          }
                          disabled={downloadMutation.isPending}
                          className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-60"
                          title="Descargar"
                        >
                          <Download size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setAttachmentToDelete(attachment)}
                          disabled={deleteMutation.isPending}
                          className="rounded-xl border border-red-500/30 p-2 text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
