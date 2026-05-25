export function formatDate(value?: Date | string | null) {
  if (!value) {
    return '';
  }

  return new Date(value).toISOString();
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

export function withUtf8Bom(csv: string) {
  return `\uFEFF${csv}`;
}
