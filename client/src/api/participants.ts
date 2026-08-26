import { baseApi } from "../env";
import type { ParticipantData } from "../types/participants";
import type { TableData, TableHeadCellData } from "../types/tables";

export async function getParticipants(): Promise<TableData> {
  const response = await fetch(`${baseApi}/participants`);
  if (!response.ok) {
    throw new Error(`${response.status}`);
  }
  const data = await response.json();
  return data;
}

export async function getParticipantDetails(
  id: number,
): Promise<ParticipantData> {
  const response = await fetch(`${baseApi}/participants/${id}`);
  if (!response.ok) {
    throw new Error(`${response.status}`);
  }
  const data = await response.json();
  return data;
}

export async function getExamTableHead(): Promise<TableHeadCellData[]> {
  const response = await fetch(`${baseApi}/test-results/head`);
  if (!response.ok) {
    throw new Error(`${response.status}`);
  }
  const data = await response.json();
  return data;
}
