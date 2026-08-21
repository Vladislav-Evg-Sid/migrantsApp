export type RefTables =
  | "areas"
  | "schools"
  | "test-attempts"
  | "participant-statuses"
  | "nations";

interface ForeignKey {
  code: number;
  name: string;
}

export type ColumnTypes = "string" | "number" | ForeignKey[];

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
  hideIdCol?: boolean;
}
