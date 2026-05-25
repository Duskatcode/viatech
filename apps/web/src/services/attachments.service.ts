import { api } from '../lib/api';
import type { Attachment } from '../types/domain';

interface UploadAttachmentPayload {
  file: File;
  type?: string;
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function buildFormData(payload: UploadAttachmentPayload) {
  const formData = new FormData();

  formData.append('file', payload.file);

  if (payload.type) {
    formData.append('type', payload.type);
  }

  return formData;
}

export const attachmentsService = {
  async listEquipmentAttachments(equipmentId: string) {
    const response = await api.get<Attachment[]>(
      `/attachments/equipment/${equipmentId}`,
    );

    return response.data;
  },

  async listMaintenanceOrderAttachments(orderId: string) {
    const response = await api.get<Attachment[]>(
      `/attachments/maintenance-orders/${orderId}`,
    );

    return response.data;
  },

  async uploadEquipmentAttachment(
    equipmentId: string,
    payload: UploadAttachmentPayload,
  ) {
    const response = await api.post<Attachment>(
      `/attachments/equipment/${equipmentId}`,
      buildFormData(payload),
    );

    return response.data;
  },

  async uploadMaintenanceOrderAttachment(
    orderId: string,
    payload: UploadAttachmentPayload,
  ) {
    const response = await api.post<Attachment>(
      `/attachments/maintenance-orders/${orderId}`,
      buildFormData(payload),
    );

    return response.data;
  },

  async downloadAttachment(attachment: Attachment) {
    const response = await api.get<Blob>(
      `/attachments/${attachment.id}/download`,
      {
        responseType: 'blob',
      },
    );

    downloadBlob(attachment.originalName, response.data);
  },

  async removeAttachment(id: string) {
    const response = await api.delete<Attachment>(`/attachments/${id}`);
    return response.data;
  },
};
