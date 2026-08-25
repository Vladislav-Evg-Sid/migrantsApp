import type { ParticipantData } from "../types/participants";
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

export async function getParticipantDetails(
  id: number,
): Promise<ParticipantData> {
  return {
    id: 7200010101,
    surname: "Эмгыр",
    firstname: "Вар Эмрейс",
    birthday: "01.01.2012",
    nation: { code: 1, name: "Нильфгаард" },
    exams: [],
  };
}
