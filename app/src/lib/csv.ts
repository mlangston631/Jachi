/** CSV for exports. Every cell is quoted, and cells that a spreadsheet could run as a formula get a leading
 *  apostrophe (the same guard as the website's admin console). */

const FORMULA = /^[=+\-@\t\r]/;

export function csvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '""';
  let text = String(value);
  if (FORMULA.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(rows: readonly (readonly (string | number | boolean | null | undefined)[])[]): string {
  return rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
