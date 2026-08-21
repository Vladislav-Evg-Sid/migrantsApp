type FilterType = "string" | "number" | "select";

export interface CellFilter {
  name: string;
  type: FilterType;
  variants?: [number, string][];
}
