export function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString();
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString();
}

export function isDateInsideRange(params: {
  value?: string | null;
  from?: string;
  to?: string;
}) {
  if (!params.value) {
    return true;
  }

  const current = new Date(params.value);

  if (params.from) {
    const from = new Date(`${params.from}T00:00:00`);
    if (current < from) {
      return false;
    }
  }

  if (params.to) {
    const to = new Date(`${params.to}T23:59:59`);
    if (current > to) {
      return false;
    }
  }

  return true;
}

export function toCsv(
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
) {
  const escapeValue = (value: string | number | null | undefined) => {
    const text = String(value ?? '');
    const escaped = text.replace(/"/g, '""');

    return `"${escaped}"`;
  };

  return [
    headers.map(escapeValue).join(','),
    ...rows.map((row) => row.map(escapeValue).join(',')),
  ].join('\n');
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
