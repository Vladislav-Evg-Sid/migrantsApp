export type RefTables =
  | "areas"
  | "schools"
  | "testAttempts"
  | "participantStatuses"
  | "nations";

export type ColumnTypes = "string" | "number" | string[];

interface ForeignKey {
  code: number;
  name: string;
}

export type TableCellData = string | number | ForeignKey;

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
