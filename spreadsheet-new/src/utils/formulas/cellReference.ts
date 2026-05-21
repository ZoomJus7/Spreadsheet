export function cellToIndex(ref: string): { row: number; col: number } | null {
  const match = ref.match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return null;
  const colStr = match[1];
  const rowStr = match[2];
  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  col -= 1;
  const row = parseInt(rowStr, 10) - 1;
  return { row, col };
}

export function indexToCell(row: number, col: number): string {
  let colStr = '';
  let c = col + 1;
  while (c > 0) {
    c--;
    colStr = String.fromCharCode((c % 26) + 'A'.charCodeAt(0)) + colStr;
    c = Math.floor(c / 26);
  }
  return `${colStr}${row + 1}`;
}