import { type CellFilter } from "../types/filters";

export async function getParticipantsFilters(): Promise<CellFilter[]> {
  return [
    {
      name: "Национальность",
      type: "select",
    },
    {
      name: "Статус",
      type: "select",
    },
    {
      name: "ФИО",
      type: "string",
    },
  ];
}
