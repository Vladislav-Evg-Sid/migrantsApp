export type RefTables =
  | "areas"
  | "schools"
  | "test-attempts"
  | "participant-statuses"
  | "nations"
  | "area-responsibles"
  | "ppts";

export interface ForeignKey {
  code: number;
  name: string;
}

export type ColumnTypes =
  | "string"
  | "number"
  | "phone"
  | "email"
  | "date"
  | "boolean"
  | ForeignKey[];

export type TableCellData = string | number | ForeignKey;

interface TableHeadCellData {
  type: ColumnTypes;
  cell: TableCellData;
}

export interface TableBodyRowData {
  row: TableCellData[];
}

export interface TableData {
  head: TableHeadCellData[];
  body: TableBodyRowData[];
  hideIdCol?: boolean;
}
