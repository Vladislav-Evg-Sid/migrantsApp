import { type TableCellData, type ColumnTypes } from "./tables";

export type TableData = {
  head: {
    cell: string;
    type: ColumnTypes;
  }[];
  body: {
    row: TableCellData[];
  }[];
};
