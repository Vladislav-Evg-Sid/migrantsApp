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
  CreatePptInput,
  CreateAreaResponsibleInput,
  UpdateAreaInput,
  UpdateSchoolInput,
  UpdateNationInput,
  UpdateParticipantStatusInput,
  UpdateTestAttemptInput,
  UpdatePptInput,
  UpdateAreaResponsibleInput,
} from "../types/dto";
import { Bounce, toast } from "react-toastify";

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
    | CreateTestAttemptInput
    | CreatePptInput
    | CreateAreaResponsibleInput,
) {
  const response = await fetch(`${baseApi}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newData),
  });
  if (!response.ok) {
    if (response.status === 409) {
      toast.error("Код не может повторяться", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
        transition: Bounce,
      });
      return;
    }
    throw new Error(`${response.status}`);
  }
  toast.success("Запись добавлена", {
    position: "top-right",
    autoClose: 5000,
    theme: "light",
    transition: Bounce,
  });
}

export async function deleteReferenceTableData(
  name: RefTables,
  id: number | string,
) {
  const response = await fetch(`${baseApi}/${name}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    if (response.status === 409) {
      toast.error("Невозможно удалить запись, от которой зависят другие", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
        transition: Bounce,
      });
      return;
    }
    throw new Error(`${response.status}`);
  }
  toast.success("Запись удалена", {
    position: "top-right",
    autoClose: 5000,
    theme: "light",
    transition: Bounce,
  });
}

export async function updateReferenceTableData(
  name: RefTables,
  id: number,
  updatedData:
    | UpdateAreaInput
    | UpdateSchoolInput
    | UpdateNationInput
    | UpdateParticipantStatusInput
    | UpdateTestAttemptInput
    | UpdatePptInput
    | UpdateAreaResponsibleInput,
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
  toast.success("Запись обновлена", {
    position: "top-right",
    autoClose: 5000,
    theme: "light",
    transition: Bounce,
  });
}
