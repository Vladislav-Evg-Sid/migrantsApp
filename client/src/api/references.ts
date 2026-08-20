import {
  type TableData,
  type RefTables,
  type TableCellData,
} from "../types/tables";

const data = new Map<RefTables, TableData>();
data.set("areas", {
  head: [
    { cell: { id: 1, data: "Код" }, type: "number" },
    { cell: { id: 2, data: "Округ" }, type: "string" },
  ],
  body: [
    {
      id: 1,
      row: [
        { id: 1, data: 123 },
        { id: 2, data: "г. Тюмень" },
      ],
    },
  ],
});
data.set("schools", {
  head: [
    { cell: { id: 1, data: "Код" }, type: "number" },
    { cell: { id: 2, data: "Название" }, type: "string" },
    { cell: { id: 3, data: "Округ" }, type: "string" },
    { cell: { id: 4, data: "Код ППТ" }, type: "number" },
  ],
  body: [
    {
      id: 1,
      row: [
        { id: 1, data: 123 },
        { id: 2, data: "МАОУ СОШ №1 г. Тюмени" },
        { id: 3, data: "г. Тюмень" },
        { id: 4, data: 321 },
      ],
    },
  ],
});
data.set("attempts", {
  head: [
    { cell: { id: 1, data: "Число" }, type: "number" },
    { cell: { id: 2, data: "Псевдоним" }, type: "string" },
  ],
  body: [
    {
      id: 1,
      row: [
        { id: 1, data: 1 },
        { id: 2, data: "первый" },
      ],
    },
    {
      id: 2,
      row: [
        { id: 1, data: 2 },
        { id: 2, data: "второй" },
      ],
    },
    {
      id: 3,
      row: [
        { id: 1, data: 3 },
        { id: 2, data: "третий" },
      ],
    },
    {
      id: 4,
      row: [
        { id: 1, data: 4 },
        { id: 2, data: "четвёртый" },
      ],
    },
    {
      id: 5,
      row: [
        { id: 1, data: 5 },
        { id: 2, data: "пятый" },
      ],
    },
    {
      id: 6,
      row: [
        { id: 1, data: 6 },
        { id: 2, data: "шестой" },
      ],
    },
    {
      id: 7,
      row: [
        { id: 1, data: 7 },
        { id: 2, data: "седьмой" },
      ],
    },
    {
      id: 8,
      row: [
        { id: 1, data: 8 },
        { id: 2, data: "восьмой" },
      ],
    },
  ],
});
data.set("statuses", {
  head: [
    { cell: { id: 1, data: "id" }, type: "number" },
    { cell: { id: 2, data: "Описание" }, type: "string" },
  ],
  body: [
    {
      id: 1,
      row: [
        { id: 1, data: 1 },
        { id: 2, data: "Сдал" },
      ],
    },
    {
      id: 2,
      row: [
        { id: 1, data: 2 },
        { id: 2, data: "Остался в детском доме" },
      ],
    },
    {
      id: 3,
      row: [
        { id: 1, data: 3 },
        { id: 2, data: "Уехал за пределы РФ" },
      ],
    },
  ],
});
data.set("nations", {
  head: [
    { cell: { id: 1, data: "id" }, type: "number" },
    { cell: { id: 2, data: "Описание" }, type: "string" },
  ],
  body: [
    {
      id: 1,
      row: [
        { id: 1, data: 1 },
        { id: 2, data: "Китай" },
      ],
    },
    {
      id: 2,
      row: [
        { id: 1, data: 2 },
        { id: 2, data: "Армения" },
      ],
    },
    {
      id: 3,
      row: [
        { id: 1, data: 3 },
        { id: 2, data: "США" },
      ],
    },
  ],
});

export async function getReferenceTableData(
  tableName: RefTables,
): Promise<TableData> {
  return data.get(tableName) ?? { head: [], body: [] };
}

export async function addReferenceTableData(
  name: RefTables,
  newData: TableCellData[],
) {
  const tableBody = (data.get(name) ?? { head: [], body: [] }).body;
  const lastId = (tableBody[tableBody.length - 1] ?? { id: 0 }).id;
  tableBody.push({ id: lastId + 1, row: newData });
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
    body: table.body.filter(
      (row) => String((row.row[0] ?? { data: -1 }).data) !== String(id),
    ),
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
      String((row.row[0] ?? { data: -1 }).data) ===
      String((updatedData[0] ?? { data: -1 }).data)
        ? { ...row, row: updatedData }
        : row,
    ),
  });
}
