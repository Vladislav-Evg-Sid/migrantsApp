import { Bounce, toast } from "react-toastify";
import { baseApi } from "../env";
import { type DateId, type ExamDate, type Month } from "../types/exams";
import type { TableCellData } from "../types/tables";
import type { TableData, UpdateTestResultInput } from "../types/dto";

type ExamDataResponse = [number, [Month, DateId[]][]];

export async function getExamDates(): Promise<ExamDate> {
  const response = await fetch(`${baseApi}/test-dates`);
  if (!response.ok) {
    toast.error("Не удалось загрузить данные участника", {
      position: "top-right",
      autoClose: 5000,
      theme: "light",
      transition: Bounce,
    });
    throw new Error(`${response.status}`);
  }
  const data: ExamDataResponse[] = await response.json();

  return new Map(data.map(([year, month]) => [year, new Map(month)]));
}

export async function deleteExam(id: TableCellData) {
  const response = await fetch(`${baseApi}/test-results/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    toast.error("Не удалось удалить попытку теста", {
      position: "top-right",
      autoClose: 5000,
      theme: "light",
      transition: Bounce,
    });
    throw new Error(`${response.status}`);
  }
  toast.success("Попытка теста удалена", {
    position: "top-right",
    autoClose: 5000,
    theme: "light",
    transition: Bounce,
  });
}

export async function updateExam(
  id: number,
  updatedData: UpdateTestResultInput,
) {
  const response = await fetch(`${baseApi}/test-results/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });
  if (!response.ok) {
    throw new Error(`${response.status}`);
  }
  toast.success("Данные экзамена обновлены обновлены", {
    position: "top-right",
    autoClose: 5000,
    theme: "light",
    transition: Bounce,
  });
}

export async function getPptByDate(examId: number): Promise<TableData> {
  const response = await fetch(`${baseApi}/test-results/dates/${examId}/ppts`);
  if (!response.ok) {
    if (response.status === 400) {
      toast.success("Некорректная дата экзамена", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
        transition: Bounce,
      });
    }
    throw new Error(`${response.status}`);
  }
  const data = await response.json();
  return data;
}

export async function getCurrentExamParticipants(
  examId: number,
  pptId: number,
): Promise<TableData> {
  const response = await fetch(
    `${baseApi}/test-results/dates/${examId}/ppts/${pptId}/participants`,
  );
  if (!response.ok) {
    toast.success("Не удалось получить данные", {
      position: "top-right",
      autoClose: 5000,
      theme: "light",
      transition: Bounce,
    });
    throw new Error(`${response.status}`);
  }
  const data = await response.json();
  return data;
}

export async function getCurrentExamOtherParticipants(
  examId: number,
  pptId: number,
): Promise<TableData> {
  const response = await fetch(
    `${baseApi}/test-results/dates/${examId}/ppts/${pptId}/other-participants`,
  );
  if (!response.ok) {
    toast.success("Не удалось получить данные", {
      position: "top-right",
      autoClose: 5000,
      theme: "light",
      transition: Bounce,
    });
    throw new Error(`${response.status}`);
  }
  const data = await response.json();
  return data;
}
