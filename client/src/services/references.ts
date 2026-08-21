import {
  type TableCellData,
  type RefTables,
  type TableData,
} from "../types/tables";
import {
  addReferenceTableData,
  deleteReferenceTableData,
  getReferenceTable,
  saveChangesTableData,
} from "../api/references";

export async function addReference(name: RefTables, data: TableCellData[]) {
  switch (name) {
    case "areas":
      if (data[0] === undefined || data[1] === undefined) {
        throw new Error("No data input");
      }
      await addReferenceTableData(name, {
        code: +data[0],
        name: String(data[1]),
      });
      break;
    case "schools":
      if (
        data[0] === undefined ||
        data[1] === undefined ||
        data[2] === undefined ||
        data[3] === undefined
      ) {
        throw new Error("No data input");
      }
      await addReferenceTableData(name, {
        code: +data[0],
        name: String(data[1]),
        address: String(data[2]),
        areaCode: +data[3],
      });
      break;
    case "test-attempts":
      if (data[0] === undefined || data[1] === undefined) {
        throw new Error("No data input");
      }
      await addReferenceTableData(name, {
        number: +data[0],
        name: String(data[1]),
      });
      break;
    case "participant-statuses":
      if (data[0] === undefined) {
        throw new Error("No data input");
      }
      await addReferenceTableData(name, {
        name: String(data[0]),
      });
      break;
    case "nations":
      if (data[0] === undefined) {
        throw new Error("No data input");
      }
      await addReferenceTableData(name, {
        name: String(data[0]),
      });
      break;
  }
}

export async function deleteReference(name: RefTables, id: number | string) {
  await deleteReferenceTableData(name, id);
}

export async function saveChanges(name: RefTables, data: TableCellData[]) {
  await saveChangesTableData(name, data);
}

export async function getReferenceTableData(
  tableName: RefTables,
): Promise<TableData> {
  const tableData = await getReferenceTable(tableName);
  if (["participant-statuses", "nations"].includes(tableName)) {
    tableData.hideIdCol = true;
  }
  return tableData;
}
