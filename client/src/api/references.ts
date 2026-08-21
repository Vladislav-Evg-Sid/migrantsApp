import {
  type TableData,
  type RefTables,
  type TableCellData,
} from "../types/tables";
import { baseApi } from "../env";
import type {
  CreateAreaInput,
  CreateNationInput,
  CreateParticipantStatusInput,
  CreatePptInput,
  CreateSchoolInput,
  CreateTestAttemptInput,
} from "../types/dto";

const data = new Map<RefTables, TableData>();
data.set("areas", {
  head: [
    { cell: "Код", type: "number" },
    { cell: "Округ", type: "string" },
  ],
  body: [
    {
      row: [123, "г. Тюмень"],
    },
  ],
});
data.set("schools", {
  head: [
    { cell: "Код", type: "number" },
    { cell: "Название", type: "string" },
    { cell: "Округ", type: "string" },
    { cell: "Код ППТ", type: "number" },
  ],
  body: [
    {
      row: [123, "МАОУ СОШ №1 г. Тюмени", "г. Тюмень", 321],
    },
  ],
});
data.set("test-attempts", {
  head: [
    { cell: "Число", type: "number" },
    { cell: "Псевдоним", type: "string" },
  ],
  body: [
    {
      row: [1, "первый"],
    },
    {
      row: [2, "второй"],
    },
    {
      row: [3, "третий"],
    },
    {
      row: [4, "четвёртый"],
    },
    {
      row: [5, "пятый"],
    },
    {
      row: [6, "шестой"],
    },
    {
      row: [7, "седьмой"],
    },
    {
      row: [8, "восьмой"],
    },
  ],
});
data.set("participant-statuses", {
  head: [
    { cell: "id", type: "number" },
    { cell: "Описание", type: "string" },
  ],
  body: [
    {
      row: [1, "Сдал"],
    },
    {
      row: [2, "Остался в детском доме"],
    },
    {
      row: [3, "Уехал за пределы РФ"],
    },
  ],
});
data.set("nations", {
  head: [
    { cell: "id", type: "number" },
    { cell: "Описание", type: "string" },
  ],
  body: [
    {
      row: [1, "Китай"],
    },
    {
      row: [2, "Армения"],
    },
    {
      row: [3, "США"],
    },
  ],
});

export async function getReferenceTable(
  tableName: RefTables,
): Promise<TableData> {
  const response = await fetch(`${baseApi}/${tableName}`);
  if (!response.ok) {
    throw new Error(`${response.status}`);
  }
  const data = await response.json();
  return data;
}

export async function addReferenceTableData(
  name: RefTables,
  newData:
    | CreateAreaInput
    | CreateSchoolInput
    | CreateNationInput
    | CreateParticipantStatusInput
    | CreateTestAttemptInput,
) {
  const response = await fetch(`${baseApi}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newData),
  });
  if (!response.ok) {
    throw new Error(`${response.status}`);
  }
}

export async function deleteReferenceTableData(
  name: RefTables,
  id: number | string,
) {
  const table = data.get(name);

  if (!table) {
    return;
  }

  data.set(name, {
    ...table,
    body: table.body.filter((row) => String(row.row[0]) !== String(id)),
  });
}

export async function saveChangesTableData(
  name: RefTables,
  updatedData: TableCellData[],
) {
  const table = data.get(name);

  if (!table) {
    return;
  }

  data.set(name, {
    ...table,
    body: table.body.map((row) =>
      String(row.row[0]) === String(updatedData[0])
        ? { ...row, row: updatedData }
        : row,
    ),
  });
}
