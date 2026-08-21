import {
  type TableData,
  type RefTables,
  type TableCellData,
} from "../types/tables";

const data = new Map<RefTables, TableData>();
data.set("areas", {
  head: [
    { cell: { data: "Код" }, type: "number" },
    { cell: { data: "Округ" }, type: "string" },
  ],
  body: [
    {
      row: [{ data: 123 }, { data: "г. Тюмень" }],
    },
  ],
});
data.set("schools", {
  head: [
    { cell: { data: "Код" }, type: "number" },
    { cell: { data: "Название" }, type: "string" },
    { cell: { data: "Округ" }, type: "string" },
    { cell: { data: "Код ППТ" }, type: "number" },
  ],
  body: [
    {
      row: [
        { data: 123 },
        { data: "МАОУ СОШ №1 г. Тюмени" },
        { data: "г. Тюмень" },
        { data: 321 },
      ],
    },
  ],
});
data.set("attempts", {
  head: [
    { cell: { data: "Число" }, type: "number" },
    { cell: { data: "Псевдоним" }, type: "string" },
  ],
  body: [
    {
      row: [{ data: 1 }, { data: "первый" }],
    },
    {
      row: [{ data: 2 }, { data: "второй" }],
    },
    {
      row: [{ data: 3 }, { data: "третий" }],
    },
    {
      row: [{ data: 4 }, { data: "четвёртый" }],
    },
    {
      row: [{ data: 5 }, { data: "пятый" }],
    },
    {
      row: [{ data: 6 }, { data: "шестой" }],
    },
    {
      row: [{ data: 7 }, { data: "седьмой" }],
    },
    {
      row: [{ data: 8 }, { data: "восьмой" }],
    },
  ],
});
data.set("statuses", {
  head: [
    { cell: { data: "id" }, type: "number" },
    { cell: { data: "Описание" }, type: "string" },
  ],
  body: [
    {
      row: [{ data: 1 }, { data: "Сдал" }],
    },
    {
      row: [{ data: 2 }, { data: "Остался в детском доме" }],
    },
    {
      row: [{ data: 3 }, { data: "Уехал за пределы РФ" }],
    },
  ],
});
data.set("nations", {
  head: [
    { cell: { data: "id" }, type: "number" },
    { cell: { data: "Описание" }, type: "string" },
  ],
  body: [
    {
      row: [{ data: 1 }, { data: "Китай" }],
    },
    {
      row: [{ data: 2 }, { data: "Армения" }],
    },
    {
      row: [{ data: 3 }, { data: "США" }],
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
  tableBody.push({ row: newData });
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
