export const exportToCSV = (
  rows: number,
  cols: number,
  getDisplayValue: (row: number, col: number) => string
): void => {
  const data: string[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < cols; c++) {
      let val = getDisplayValue(r, c);
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      row.push(val);
    }
    data.push(row);
  }
  const csvContent = data.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', 'spreadsheet.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (
  rows: number,
  cols: number,
  getCellRaw: (row: number, col: number) => string
): void => {
  const cells: Record<string, string> = {};
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const raw = getCellRaw(r, c);
      if (raw !== '') {
        const colLetter = String.fromCharCode(65 + c);
        const ref = `${colLetter}${r + 1}`;
        cells[ref] = raw;
      }
    }
  }
  const data = { rows, cols, cells };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'spreadsheet.json';
  link.click();
  URL.revokeObjectURL(link.href);
};