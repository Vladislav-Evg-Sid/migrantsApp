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
  return getReferenceTable(tableName);
}
