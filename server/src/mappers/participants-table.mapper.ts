import type { TableData } from "../types/reference-data.js";
import type { ParticipantListRow } from "../types/repository/participants.repository.types.js";
import type { NationRow } from "../types/repository/reference-data.repository.types.js";

function formatDate(day: number, month: number, year: number): string {
  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
}

export function mapParticipantsTable(
  rows: ParticipantListRow[],
  nations: NationRow[],
): TableData {
  return {
    head: [
      { type: "number", cell: "ID" },
      { type: "string", cell: "Фамилия" },
      { type: "string", cell: "Имя" },
      { type: "string", cell: "Отчество" },
      { type: "date", cell: "Дата рождения" },
      {
        type: nations.map((nation) => ({ code: nation.id, name: nation.name })),
        cell: "Национальность",
      },
    ],
    body: rows.map((row) => ({
      row: [
        Number(row.id),
        row.surname,
        row.name,
        row.patronymic,
        formatDate(row.birth_day, row.birth_month, row.birth_year),
        { code: row.nation_id, name: row.nation_name },
      ],
    })),
  };
}
