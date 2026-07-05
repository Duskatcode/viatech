import { FileDown } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

import { getErrorMessage } from '../lib/error-message';
import { reportsService } from '../services/reports.service';
import { useToast } from '../ui/useToast';

interface MaintenanceOrderPdfButtonProps {
  orderId: string;
}

export function MaintenanceOrderPdfButton({
  orderId,
}: MaintenanceOrderPdfButtonProps) {
  const { addToast } = useToast();

  const downloadMutation = useMutation({
    mutationFn: () => reportsService.downloadMaintenanceOrderPdf(orderId),
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'PDF generado',
        description: 'La hoja imprimible de mantenimiento fue descargada.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'No se pudo descargar el PDF',
        description: getErrorMessage(error),
      });
    },
  });

  return (
    <button
      type="button"
      onClick={() => void downloadMutation.mutateAsync()}
      disabled={downloadMutation.isPending}
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FileDown size={18} />
      {downloadMutation.isPending ? 'Generando PDF...' : 'Descargar PDF'}
    </button>
  );
}
