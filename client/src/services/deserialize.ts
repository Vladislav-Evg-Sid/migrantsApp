import { type Area } from "../types/dto";
import { type TableData } from "../types/tables";

export function deserializeAreas(rawAreas: Area[]): TableData {
  return {
    head: [
      { cell: "Код", type: "number" },
      { cell: "Округ", type: "string" },
    ],
    body: rawAreas.map((area) => ({ row: [area.code, area.name] })),
  };
}
