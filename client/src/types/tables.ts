export type RefTables =
  | "areas"
  | "schools"
  | "attempts"
  | "statuses"
  | "nations";

export type ColumnTypes = "string" | "number" | string[];

export interface TableCellData {
  data: string | number;
}

interface TableHeadCellData {
  type: ColumnTypes;
  cell: TableCellData;
}

interface TableBodyRowData {
  row: TableCellData[];
}

export interface TableData {
  head: TableHeadCellData[];
  body: TableBodyRowData[];
}
