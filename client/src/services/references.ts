import { type TableCellData, type RefTables } from "../types/tables";
import {
  addReferenceTableData,
  deleteReferenceTableData,
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
