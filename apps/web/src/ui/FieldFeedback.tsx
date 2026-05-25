import { AlertCircle, Info } from 'lucide-react';

interface FieldFeedbackProps {
  message?: string;
}

export function FieldError({ message }: FieldFeedbackProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 inline-flex items-start gap-2 text-xs text-red-300">
      <AlertCircle className="mt-0.5 shrink-0" size={14} />
      <span>{message}</span>
    </p>
  );
}

export function FieldHint({ message }: FieldFeedbackProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 inline-flex items-start gap-2 text-xs text-slate-500">
      <Info className="mt-0.5 shrink-0" size={14} />
      <span>{message}</span>
    </p>
  );
}

export function RequiredMark() {
  return <span className="text-red-300">*</span>;
}
