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
  CreateSchoolInput,
  CreateTestAttemptInput,
  UpdateAreaInput,
  UpdateSchoolInput,
  UpdateNationInput,
  UpdateParticipantStatusInput,
  UpdateTestAttemptInput,
} from "../types/dto";

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
  const response = await fetch(`${baseApi}/${name}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`${response.status}`);
  }
}

export async function updateReferenceTableData(
  name: RefTables,
  id: number,
  updatedData:
    | UpdateAreaInput
    | UpdateSchoolInput
    | UpdateNationInput
    | UpdateParticipantStatusInput
    | UpdateTestAttemptInput,
) {
  const response = await fetch(`${baseApi}/${name}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });
  if (!response.ok) {
    throw new Error(`${response.status}`);
  }
}
