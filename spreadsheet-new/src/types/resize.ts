export type ResizeDirection = 'column' | 'row';
export interface ResizeState {
  isResizing: boolean;
  direction: ResizeDirection | null;
  index: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}