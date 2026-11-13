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
      { type: "string", cell: "Результат последнего экзамена" },
      { type: "boolean", cell: "Специальная категория Минпрос 727" },
      { type: "string", cell: "Кратность тестирования" },
      { type: "string", cell: "МО последнего тестирования" },
      { type: "date", cell: "Дата последнего тестирования" },
      { type: "number", cell: "Класс" },
    ],
    body: rows.map((row) => ({
      row: [
        Number(row.id),
        row.surname,
        row.name,
        row.patronymic,
        formatDate(row.birth_day, row.birth_month, row.birth_year),
        { code: row.nation_id, name: row.nation_name },
        row.latest_result,
        row.latest_special_category,
        row.latest_multiplicity,
        row.latest_area_name,
        row.latest_test_day !== null && row.latest_test_month !== null && row.latest_test_year !== null
          ? formatDate(row.latest_test_day, row.latest_test_month, row.latest_test_year)
          : null,
        row.latest_class,
      ],
    })),
  };
}
