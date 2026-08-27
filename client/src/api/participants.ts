import { Bounce, toast } from "react-toastify";
import { baseApi } from "../env";
import type {
  CreateParticipantInput,
  CreateTestResultInput,
} from "../types/dto";
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

export async function getParticipantExams(
  participantID: number,
): Promise<TableData> {
  const response = await fetch(`${baseApi}/participant-exams/${participantID}`);
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

export async function createParticipant(
  participant: CreateParticipantInput,
): Promise<number> {
  const response = await fetch(`${baseApi}/participants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(participant),
  });
  if (!response.ok) {
    toast.error("Не удалось создать участника", {
      position: "top-right",
      autoClose: 5000,
      theme: "light",
      transition: Bounce,
    });
    throw new Error(`${response.status}`);
  }
  toast.success("Участник создан", {
    position: "top-right",
    autoClose: 5000,
    theme: "light",
    transition: Bounce,
  });
  const data = await response.json();
  return data.id;
}

export async function createParticipantExam(exam: CreateTestResultInput) {
  const response = await fetch(`${baseApi}/test-results`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(exam),
  });
  if (!response.ok) {
    toast.error("Не удалось добаить экзамен", {
      position: "top-right",
      autoClose: 5000,
      theme: "light",
      transition: Bounce,
    });
    throw new Error(`${response.status}`);
  }
  toast.success("Экзамен добавлен", {
    position: "top-right",
    autoClose: 5000,
    theme: "light",
    transition: Bounce,
  });
}
