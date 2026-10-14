import ExcelJS from 'exceljs';

// Builds an .xlsx where every column is as wide as its longest value, so nothing is cut off.
export async function toXlsx(sheetName, header, rows) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName.slice(0, 31), { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.addRow(header);
  rows.forEach((r) => ws.addRow(r.map((v) => (v == null ? '' : v))));
  const head = ws.getRow(1);
  head.font = { bold: true };
  head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDE4FF' } };
  header.forEach((h, i) => {
    let max = String(h).length;
    for (const r of rows) max = Math.max(max, String(r[i] ?? '').length);
    ws.getColumn(i + 1).width = Math.min(Math.max(max + 3, 8), 120);
  });
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: header.length } };
  return Buffer.from(await wb.xlsx.writeBuffer());
}
export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';