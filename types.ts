export interface AxisItem {
  id: number;
  label: string;
  description: string;
}

export interface IntersectionData {
  description: string;
  metaphor: string;
}

export interface CellCoordinate {
  rowId: number;
  colId: number;
}

export type MatrixData = Record<string, IntersectionData>;

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}