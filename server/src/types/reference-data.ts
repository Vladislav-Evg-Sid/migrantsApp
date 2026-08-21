export type ForeignKey = {
  code: number;
  name: string;
};

export type ColumnType = "string" | "number" | string[];

export type TableCellData = string | number | ForeignKey;

export type TableData = {
  head: {
    cell: string;
    type: ColumnType;
  }[];
  body: {
    row: TableCellData[];
  }[];
};
