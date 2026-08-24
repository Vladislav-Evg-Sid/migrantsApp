import type { TableData } from "../types/tables";

export async function getParticipants(): Promise<TableData> {
  return {
    head: [
      { type: "number", cell: "ID" },
      { type: "string", cell: "Фамилия" },
      { type: "string", cell: "Имя" },
      { type: "string", cell: "Отчество" },
      { type: "date", cell: "Дата рождения" },
      { type: [{ code: 1, name: "123" }], cell: "Национальность" },
      { type: [{ code: 1, name: "123" }], cell: "Статус" },
    ],
    body: [
      {
        row: [
          123,
          "Иванов",
          "Иван",
          "Иванович",
          "01.01.2010",
          { code: 1, name: "123" },
          { code: 1, name: "123" },
        ],
      },
    ],
  };
}
