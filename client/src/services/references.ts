import {
  type TableCellData,
  type RefTables,
  type TableData,
} from "../types/tables";
import {
  addReferenceTableData,
  deleteReferenceTableData,
  getAreas,
  saveChangesTableData,
} from "../api/references";
import { deserializeAreas } from "./deserialize";

export async function addReference(name: RefTables, data: TableCellData[]) {
  await addReferenceTableData(name, data);
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
  switch (tableName) {
    case "areas":
      const rawAreas = await getAreas();
      return deserializeAreas(rawAreas);
    // case "schools":
    //   return "Школы";
    // case "testAttempts":
    //   return "Кратность участия в тестировании";
    // case "participantStatuses":
    //   return "Статусы участников";
    // case "nations":
    //   return "Национальности";
  }

  return { head: [], body: [] };
}
