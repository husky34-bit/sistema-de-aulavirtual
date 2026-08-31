// Utilidad de exportación a CSV (con BOM para Excel).
export function toCsv(headers: string[], rows: (string | number | null | boolean)[][]): string {
  const escape = (val: string | number | null | boolean) => {
    const s = val === null || val === undefined ? '' : String(val);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(row.map(escape).join(','));
  }
  return '\uFEFF' + lines.join('\r\n');
}
