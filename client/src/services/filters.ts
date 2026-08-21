import { getReferenceTable } from "../api/references";
import { type CellFilter } from "../types/filters";

export async function getParticipantsFilters(): Promise<CellFilter[]> {
  const nationsTable = (await getReferenceTable("nations")).body;
  const nationVariants: [number, string][] = nationsTable.map(({ row }) => [
    +(row[0] ?? -1),
    String(row[1] ?? ""),
  ]);

  const participantStatusesTable = (
    await getReferenceTable("participant-statuses")
  ).body;
  const participantStatusesVariants: [number, string][] =
    participantStatusesTable.map(({ row }) => [
      +(row[0] ?? -1),
      String(row[1] ?? ""),
    ]);

  return [
    {
      name: "Национальность",
      type: "select",
      variants: nationVariants,
    },
    {
      name: "Статус",
      type: "select",
      variants: participantStatusesVariants,
    },
    {
      name: "ФИО",
      type: "string",
    },
  ];
}
